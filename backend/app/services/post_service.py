from typing import Optional, List
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc, asc, or_
from app.models.post import Post, PostStatus
from app.models.category import Category
from app.models.tag import Tag
from app.models.like import Like
from app.models.comment import Comment
from app.models.user import User
from app.schemas.post import PostCreate, PostUpdate, PostList, PaginatedPosts
from app.utils.slug import slugify, unique_slug
from app.utils.reading_time import calculate_reading_time
from datetime import datetime, timezone


class PostService:
    @staticmethod
    def get_paginated_posts(
        db: Session,
        page: int = 1,
        per_page: int = 12,
        search: Optional[str] = None,
        category: Optional[str] = None,
        tag: Optional[str] = None,
        author_id: Optional[int] = None,
        status: Optional[str] = None,
        sort_by: str = "newest",
    ) -> PaginatedPosts:
        query = db.query(Post).options(
            joinedload(Post.author),
            joinedload(Post.category),
            joinedload(Post.tags),
        )

        if status:
            query = query.filter(Post.status == PostStatus[status.upper()])
        else:
            query = query.filter(Post.status == PostStatus.PUBLISHED)

        if author_id:
            query = query.filter(Post.author_id == author_id)

        if category:
            query = query.join(Category, Post.category_id == Category.id).filter(
                or_(Category.slug == category, Category.name.ilike(f"%{category}%"))
            )

        if tag:
            query = query.join(Post.tags).filter(
                or_(Tag.slug == tag, Tag.name.ilike(f"%{tag}%"))
            )

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

        if sort_by == "popular":
            like_sub = (
                db.query(Like.post_id, func.count(Like.id).label("cnt"))
                .group_by(Like.post_id)
                .subquery()
            )
            query = query.outerjoin(like_sub, Post.id == like_sub.c.post_id).order_by(
                desc(func.coalesce(like_sub.c.cnt, 0)),
                desc(Post.created_at),
            )
        elif sort_by == "oldest":
            query = query.order_by(asc(Post.created_at))
        else:
            query = query.order_by(desc(Post.published_at), desc(Post.created_at))

        total = query.count()
        posts = query.offset((page - 1) * per_page).limit(per_page).all()
        pages = max(1, (total + per_page - 1) // per_page)

        items = []
        for p in posts:
            like_cnt = (
                db.query(func.count(Like.id)).filter(Like.post_id == p.id).scalar() or 0
            )
            comm_cnt = (
                db.query(func.count(Comment.id)).filter(Comment.post_id == p.id).scalar()
                or 0
            )
            items.append(
                PostList(
                    id=p.id,
                    title=p.title,
                    slug=p.slug,
                    excerpt=p.excerpt,
                    featured_image=p.featured_image,
                    status=p.status,
                    views=p.views or 0,
                    created_at=p.created_at,
                    published_at=p.published_at,
                    author_id=p.author_id,
                    author_name=p.author.name,
                    author_avatar=p.author.profile_image,
                    category_name=p.category.name if p.category else None,
                    category_slug=p.category.slug if p.category else None,
                    like_count=like_cnt,
                    comment_count=comm_cnt,
                    reading_time=calculate_reading_time(p.content or ""),
                )
            )

        return PaginatedPosts(
            items=items, total=total, page=page, per_page=per_page, pages=pages
        )
