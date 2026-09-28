from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from app.core.dependencies import get_db, get_current_user
from app.models.bookmark import Bookmark
from app.models.post import Post
from app.models.like import Like
from app.models.comment import Comment
from app.models.user import User
from app.schemas.post import PaginatedPosts, PostList
from app.utils.reading_time import calculate_reading_time

router = APIRouter(tags=["bookmarks"])


@router.post("/api/posts/{post_id}/bookmark")
def bookmark_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    existing = db.query(Bookmark).filter(Bookmark.post_id == post_id, Bookmark.user_id == current_user.id).first()
    if existing:
        return {"bookmarked": True}

    bm = Bookmark(post_id=post_id, user_id=current_user.id)
    db.add(bm)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
    return {"bookmarked": True}


@router.delete("/api/posts/{post_id}/bookmark")
def remove_bookmark(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    bm = db.query(Bookmark).filter(Bookmark.post_id == post_id, Bookmark.user_id == current_user.id).first()
    if bm:
        db.delete(bm)
        db.commit()
    return {"bookmarked": False}


@router.get("/api/bookmarks", response_model=PaginatedPosts)
def get_bookmarks(
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = (
        db.query(Post)
        .join(Bookmark, Bookmark.post_id == Post.id)
        .options(joinedload(Post.author), joinedload(Post.category), joinedload(Post.tags))
        .filter(Bookmark.user_id == current_user.id)
        .order_by(Bookmark.created_at.desc())
    )
    total = query.count()
    posts = query.offset((page - 1) * per_page).limit(per_page).all()
    pages = max(1, (total + per_page - 1) // per_page)

    items = []
    for post in posts:
        like_count = db.query(func.count(Like.id)).filter(Like.post_id == post.id).scalar() or 0
        comment_count = db.query(func.count(Comment.id)).filter(Comment.post_id == post.id).scalar() or 0
        items.append(PostList(
            id=post.id,
            title=post.title,
            slug=post.slug,
            excerpt=post.excerpt,
            featured_image=post.featured_image,
            status=post.status,
            views=post.views or 0,
            created_at=post.created_at,
            published_at=post.published_at,
            author_id=post.author_id,
            author_name=post.author.name,
            author_avatar=post.author.profile_image,
            category_name=post.category.name if post.category else None,
            category_slug=post.category.slug if post.category else None,
            like_count=like_count,
            comment_count=comment_count,
            reading_time=calculate_reading_time(post.content or ""),
        ))

    return PaginatedPosts(items=items, total=total, page=page, per_page=per_page, pages=pages)
