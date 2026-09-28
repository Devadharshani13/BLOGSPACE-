import enum
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, BigInteger
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.database import Base
from app.models.tag import post_tags


class PostStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    slug = Column(String(600), unique=True, nullable=False, index=True)
    excerpt = Column(Text, nullable=True)
    content = Column(Text, nullable=False)
    featured_image = Column(String(500), nullable=True)
    author_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    category_id = Column(
        Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True
    )
    status = Column(Enum(PostStatus), default=PostStatus.DRAFT, nullable=False)
    views = Column(BigInteger, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    published_at = Column(DateTime(timezone=True), nullable=True)

    author = relationship("User", back_populates="posts")
    category = relationship("Category", back_populates="posts")
    tags = relationship("Tag", secondary=post_tags, back_populates="posts")
    comments = relationship(
        "Comment", back_populates="post", cascade="all, delete-orphan"
    )
    likes = relationship("Like", back_populates="post", cascade="all, delete-orphan")
    bookmarks = relationship(
        "Bookmark", back_populates="post", cascade="all, delete-orphan"
    )
