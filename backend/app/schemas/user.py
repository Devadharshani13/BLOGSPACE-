from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.models.user import UserRole


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    profile_image: Optional[str] = None
    bio: Optional[str] = None
    role: UserRole
    is_active: bool
    created_at: datetime
    post_count: Optional[int] = 0


class UserUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    profile_image: Optional[str] = None


class UserStats(BaseModel):
    total_posts: int = 0
    published_posts: int = 0
    drafts: int = 0
    total_likes: int = 0
    total_comments: int = 0
    total_views: int = 0


class UserAdminUpdate(BaseModel):
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
