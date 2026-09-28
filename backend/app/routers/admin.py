from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, desc
from app.core.dependencies import get_db, require_admin
from app.models.user import User, UserRole
from app.models.post import Post, PostStatus
from app.models.comment import Comment
from app.models.like import Like
from app.models.bookmark import Bookmark
from app.schemas.user import UserOut, UserAdminUpdate
from app.schemas.post import PostList, PaginatedPosts
from app.utils.reading_time import calculate_reading_time
from typing import Optional

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/stats")
def get_admin_stats(
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_posts = db.query(func.count(Post.id)).scalar() or 0
    published_posts = db.query(func.count(Post.id)).filter(Post.status == PostStatus.PUBLISHED).scalar() or 0
    draft_posts = total_posts - published_posts
    total_comments = db.query(func.count(Comment.id)).scalar() or 0
    total_likes = db.query(func.count(Like.id)).scalar() or 0
    total_views = db.query(func.sum(Post.views)).scalar() or 0

    return {
        "total_users": total_users,
        "total_posts": total_posts,
        "published_posts": published_posts,
        "draft_posts": draft_posts,
        "total_comments": total_comments,
        "total_likes": total_likes,
        "total_views": total_views,
    }


@router.get("/users")
def get_all_users(
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    query = db.query(User)
    if search:
        s = f"%{search}%"
        query = query.filter(or_(User.name.ilike(s), User.email.ilike(s)))
    query = query.order_by(desc(User.created_at))
    total = query.count()
    users = query.offset((page - 1) * per_page).limit(per_page).all()
    pages = max(1, (total + per_page - 1) // per_page)

    result = []
    for u in users:
        out = UserOut.model_validate(u)
        out.post_count = db.query(func.count(Post.id)).filter(Post.author_id == u.id).scalar() or 0
        result.append(out)
    return {"items": result, "total": total, "page": page, "per_page": per_page, "pages": pages}


@router.put("/users/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    payload: UserAdminUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if payload.role is not None:
        user.role = payload.role
    if payload.is_active is not None:
        user.is_active = payload.is_active
    db.commit()
    db.refresh(user)
    out = UserOut.model_validate(user)
    out.post_count = db.query(func.count(Post.id)).filter(Post.author_id == user.id).scalar() or 0
    return out


@router.get("/posts")
def get_all_posts(
    search: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    from sqlalchemy.orm import joinedload
    query = db.query(Post).options(
        joinedload(Post.author), joinedload(Post.category), joinedload(Post.tags)
    )
    if search:
        s = f"%{search}%"
        query = query.join(User, Post.author_id == User.id).filter(
            or_(Post.title.ilike(s), User.name.ilike(s))
        )
    if status_filter:
        query = query.filter(Post.status == PostStatus[status_filter.upper()])
    query = query.order_by(desc(Post.created_at))
    total = query.count()
    posts = query.offset((page - 1) * per_page).limit(per_page).all()
    pages = max(1, (total + per_page - 1) // per_page)

    items = [
        PostList(
            id=p.id, title=p.title, slug=p.slug, excerpt=p.excerpt,
            featured_image=p.featured_image, status=p.status,
            views=p.views or 0, created_at=p.created_at, published_at=p.published_at,
            author_id=p.author_id, author_name=p.author.name, author_avatar=p.author.profile_image,
            category_name=p.category.name if p.category else None,
            category_slug=p.category.slug if p.category else None,
            like_count=db.query(func.count(Like.id)).filter(Like.post_id == p.id).scalar() or 0,
            comment_count=db.query(func.count(Comment.id)).filter(Comment.post_id == p.id).scalar() or 0,
            reading_time=calculate_reading_time(p.content or ""),
        )
        for p in posts
    ]
    return {"items": items, "total": total, "page": page, "per_page": per_page, "pages": pages}


@router.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    db.delete(post)
    db.commit()


@router.get("/comments")
def get_all_comments(
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    from sqlalchemy.orm import joinedload
    query = db.query(Comment).options(joinedload(Comment.user), joinedload(Comment.post))
    if search:
        query = query.filter(Comment.content.ilike(f"%{search}%"))
    query = query.order_by(desc(Comment.created_at))
    total = query.count()
    comments = query.offset((page - 1) * per_page).limit(per_page).all()
    pages = max(1, (total + per_page - 1) // per_page)

    items = [
        {
            "id": c.id,
            "content": c.content,
            "created_at": c.created_at,
            "user_id": c.user_id,
            "user_name": c.user.name if c.user else "Unknown",
            "post_id": c.post_id,
            "post_title": c.post.title if c.post else "Unknown",
            "post_slug": c.post.slug if c.post else None,
        }
        for c in comments
    ]
    return {"items": items, "total": total, "page": page, "per_page": per_page, "pages": pages}


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
    db.delete(comment)
    db.commit()
