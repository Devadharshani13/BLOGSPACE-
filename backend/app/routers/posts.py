from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, or_, desc, asc
from app.core.dependencies import get_db, get_current_user, get_optional_user
from app.models.post import Post, PostStatus
from app.models.user import User
from app.models.category import Category
from app.models.tag import Tag
from app.models.like import Like
from app.models.bookmark import Bookmark
from app.models.comment import Comment
from app.schemas.post import (
    PostCreate, PostUpdate, PostOut, PostList, PaginatedPosts,
    AuthorInPost, CategoryInPost, TagInPost,
)
from app.utils.slug import slugify, unique_slug
from app.utils.reading_time import calculate_reading_time

router = APIRouter(prefix="/api/posts", tags=["posts"])


def _build_post_list(post: Post, db: Session) -> PostList:
    like_count = db.query(func.count(Like.id)).filter(Like.post_id == post.id).scalar() or 0
    comment_count = db.query(func.count(Comment.id)).filter(Comment.post_id == post.id).scalar() or 0
    return PostList(
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
    )


def _build_post_out(post: Post, db: Session, current_user: Optional[User] = None) -> PostOut:
    like_count = db.query(func.count(Like.id)).filter(Like.post_id == post.id).scalar() or 0
    bookmark_count = db.query(func.count(Bookmark.id)).filter(Bookmark.post_id == post.id).scalar() or 0
    comment_count = db.query(func.count(Comment.id)).filter(Comment.post_id == post.id).scalar() or 0

    is_liked = False
    is_bookmarked = False
    if current_user:
        is_liked = db.query(Like).filter(Like.post_id == post.id, Like.user_id == current_user.id).first() is not None
        is_bookmarked = db.query(Bookmark).filter(Bookmark.post_id == post.id, Bookmark.user_id == current_user.id).first() is not None

    return PostOut(
        id=post.id,
        title=post.title,
        slug=post.slug,
        excerpt=post.excerpt,
        content=post.content,
        featured_image=post.featured_image,
        status=post.status,
        views=post.views or 0,
        created_at=post.created_at,
        updated_at=post.updated_at,
        published_at=post.published_at,
        author=AuthorInPost.model_validate(post.author),
        category=CategoryInPost.model_validate(post.category) if post.category else None,
        tags=[TagInPost.model_validate(t) for t in post.tags],
        like_count=like_count,
        bookmark_count=bookmark_count,
        comment_count=comment_count,
        is_liked=is_liked,
        is_bookmarked=is_bookmarked,
        reading_time=calculate_reading_time(post.content or ""),
    )


def _get_or_create_tags(tag_names: list, db: Session) -> list:
    tags = []
    for name in tag_names:
        name = name.strip()
        if not name:
            continue
        slug = slugify(name)
        tag = db.query(Tag).filter(Tag.slug == slug).first()
        if not tag:
            tag = Tag(name=name, slug=slug)
            db.add(tag)
            db.flush()
        tags.append(tag)
    return tags


@router.get("", response_model=PaginatedPosts)
def list_posts(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    tag: Optional[str] = Query(None),
    author_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    sort_by: str = Query("newest"),
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=50),
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    query = (
        db.query(Post)
        .options(
            joinedload(Post.author),
            joinedload(Post.category),
            joinedload(Post.tags),
        )
    )

    # Access control: public sees only PUBLISHED; owner sees own drafts too
    if status and current_user:
        if status.upper() == "DRAFT":
            query = query.filter(Post.author_id == current_user.id, Post.status == PostStatus.DRAFT)
        elif status.upper() == "PUBLISHED":
            query = query.filter(Post.status == PostStatus.PUBLISHED)
        else:
            query = query.filter(Post.status == PostStatus.PUBLISHED)
    else:
        query = query.filter(Post.status == PostStatus.PUBLISHED)

    if author_id:
        query = query.filter(Post.author_id == author_id)

    if search:
        s = f"%{search}%"
        query = query.join(User, Post.author_id == User.id).filter(
            or_(
                Post.title.ilike(s),
                Post.content.ilike(s),
                Post.excerpt.ilike(s),
                User.name.ilike(s),
            )
        )

    if category:
        query = query.join(Category, Post.category_id == Category.id).filter(
            or_(Category.slug == category, Category.name.ilike(f"%{category}%"))
        )

    if tag:
        query = query.join(Post.tags).filter(
            or_(Tag.slug == tag, Tag.name.ilike(f"%{tag}%"))
        )

    if sort_by == "popular":
        # Sort by like count (subquery)
        like_count_sub = (
            db.query(Like.post_id, func.count(Like.id).label("lc"))
            .group_by(Like.post_id)
            .subquery()
        )
        query = query.outerjoin(like_count_sub, Post.id == like_count_sub.c.post_id).order_by(
            desc(func.coalesce(like_count_sub.c.lc, 0)),
            desc(Post.created_at),
        )
    elif sort_by == "oldest":
        query = query.order_by(asc(Post.created_at))
    else:
        query = query.order_by(desc(Post.published_at), desc(Post.created_at))

    total = query.count()
    posts = query.offset((page - 1) * per_page).limit(per_page).all()
    pages = max(1, (total + per_page - 1) // per_page)

    return PaginatedPosts(
        items=[_build_post_list(p, db) for p in posts],
        total=total,
        page=page,
        per_page=per_page,
        pages=pages,
    )


@router.get("/me/posts", response_model=PaginatedPosts)
def get_my_posts(
    status_filter: Optional[str] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = (
        db.query(Post)
        .options(joinedload(Post.author), joinedload(Post.category), joinedload(Post.tags))
        .filter(Post.author_id == current_user.id)
    )
    if status_filter:
        query = query.filter(Post.status == PostStatus[status_filter.upper()])
    query = query.order_by(desc(Post.created_at))

    total = query.count()
    posts = query.offset((page - 1) * per_page).limit(per_page).all()
    pages = max(1, (total + per_page - 1) // per_page)

    return PaginatedPosts(
        items=[_build_post_list(p, db) for p in posts],
        total=total,
        page=page,
        per_page=per_page,
        pages=pages,
    )


@router.get("/{slug}", response_model=PostOut)
def get_post(
    slug: str,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    post = (
        db.query(Post)
        .options(
            joinedload(Post.author),
            joinedload(Post.category),
            joinedload(Post.tags),
        )
        .filter(Post.slug == slug)
        .first()
    )
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    # Only published posts visible to public; owner/admin can see drafts
    if post.status != PostStatus.PUBLISHED:
        if not current_user or (current_user.id != post.author_id and current_user.role.value != "ADMIN"):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    # Increment views
    post.views = (post.views or 0) + 1
    db.commit()
    db.refresh(post)

    return _build_post_out(post, db, current_user)


@router.post("", response_model=PostOut, status_code=status.HTTP_201_CREATED)
def create_post(
    payload: PostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Generate slug
    base_slug = slugify(payload.slug or payload.title)
    slug = unique_slug(base_slug, Post, db)

    post = Post(
        title=payload.title,
        slug=slug,
        excerpt=payload.excerpt,
        content=payload.content,
        featured_image=payload.featured_image,
        author_id=current_user.id,
        category_id=payload.category_id,
        status=payload.status,
        published_at=datetime.now(timezone.utc) if payload.status == PostStatus.PUBLISHED else None,
    )

    # Handle tags
    if payload.tags:
        post.tags = _get_or_create_tags(payload.tags, db)

    db.add(post)
    db.commit()
    db.refresh(post)

    return _build_post_out(post, db, current_user)


@router.put("/{post_id}", response_model=PostOut)
def update_post(
    post_id: int,
    payload: PostUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    if post.author_id != current_user.id and current_user.role.value != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    if payload.title is not None:
        post.title = payload.title
    if payload.slug is not None:
        new_slug = slugify(payload.slug)
        post.slug = unique_slug(new_slug, Post, db, exclude_id=post.id)
    if payload.excerpt is not None:
        post.excerpt = payload.excerpt
    if payload.content is not None:
        post.content = payload.content
    if payload.featured_image is not None:
        post.featured_image = payload.featured_image
    if payload.category_id is not None:
        post.category_id = payload.category_id
    if payload.tags is not None:
        post.tags = _get_or_create_tags(payload.tags, db)
    if payload.status is not None:
        if payload.status == PostStatus.PUBLISHED and post.status != PostStatus.PUBLISHED:
            post.published_at = datetime.now(timezone.utc)
        post.status = payload.status

    db.commit()
    db.refresh(post)
    return _build_post_out(post, db, current_user)


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    if post.author_id != current_user.id and current_user.role.value != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    db.delete(post)
    db.commit()


@router.post("/{post_id}/publish", response_model=PostOut)
def publish_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = db.query(Post).options(
        joinedload(Post.author), joinedload(Post.category), joinedload(Post.tags)
    ).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    if post.author_id != current_user.id and current_user.role.value != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    post.status = PostStatus.PUBLISHED
    if not post.published_at:
        post.published_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(post)
    return _build_post_out(post, db, current_user)


@router.post("/{post_id}/unpublish", response_model=PostOut)
def unpublish_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = db.query(Post).options(
        joinedload(Post.author), joinedload(Post.category), joinedload(Post.tags)
    ).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    if post.author_id != current_user.id and current_user.role.value != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    post.status = PostStatus.DRAFT
    db.commit()
    db.refresh(post)
    return _build_post_out(post, db, current_user)
