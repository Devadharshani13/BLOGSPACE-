from typing import List
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from app.models.post import Post, PostStatus
from app.models.user import User
from app.models.category import Category
from app.models.tag import Tag


class SearchService:
    @staticmethod
    def search_posts(db: Session, query_str: str, limit: int = 10) -> List[Post]:
        """
        Full text/ilike search across title, content, excerpt, author name,
        category name, and tags. Designed for easy extension to pgvector / semantic embeddings.
        """
        if not query_str:
            return []

        pattern = f"%{query_str.strip()}%"
        return (
            db.query(Post)
            .options(
                joinedload(Post.author),
                joinedload(Post.category),
                joinedload(Post.tags),
            )
            .outerjoin(User, Post.author_id == User.id)
            .outerjoin(Category, Post.category_id == Category.id)
            .outerjoin(Post.tags)
            .filter(
                Post.status == PostStatus.PUBLISHED,
                or_(
                    Post.title.ilike(pattern),
                    Post.content.ilike(pattern),
                    Post.excerpt.ilike(pattern),
                    User.name.ilike(pattern),
                    Category.name.ilike(pattern),
                    Tag.name.ilike(pattern),
                ),
            )
            .distinct()
            .limit(limit)
            .all()
        )
