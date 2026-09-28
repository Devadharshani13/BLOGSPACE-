from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.models.post import PostStatus


class TagInPost(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    slug: str


class AuthorInPost(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    profile_image: Optional[str] = None
    bio: Optional[str] = None


class CategoryInPost(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    slug: str


class PostCreate(BaseModel):
    title: str
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    content: str
    featured_image: Optional[str] = None
    category_id: Optional[int] = None
    tags: List[str] = []
    status: PostStatus = PostStatus.DRAFT


class PostUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    featured_image: Optional[str] = None
    category_id: Optional[int] = None
    tags: Optional[List[str]] = None
    status: Optional[PostStatus] = None


class PostOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    slug: str
    excerpt: Optional[str] = None
    content: str
    featured_image: Optional[str] = None
    status: PostStatus
    views: int = 0
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None
    author: AuthorInPost
    category: Optional[CategoryInPost] = None
    tags: List[TagInPost] = []
    like_count: int = 0
    bookmark_count: int = 0
    comment_count: int = 0
    is_liked: bool = False
    is_bookmarked: bool = False
    reading_time: int = 1


class PostList(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    slug: str
    excerpt: Optional[str] = None
    featured_image: Optional[str] = None
    status: PostStatus
    views: int = 0
    created_at: datetime
    published_at: Optional[datetime] = None
    author_id: int
    author_name: str
    author_avatar: Optional[str] = None
    category_name: Optional[str] = None
    category_slug: Optional[str] = None
    like_count: int = 0
    comment_count: int = 0
    reading_time: int = 1


class PaginatedPosts(BaseModel):
    items: List[PostList]
    total: int
    page: int
    per_page: int
    pages: int
