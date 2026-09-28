from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class CommentCreate(BaseModel):
    content: str
    parent_id: Optional[int] = None


class CommentUserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    profile_image: Optional[str] = None


class CommentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    post_id: int
    user_id: int
    parent_id: Optional[int] = None
    content: str
    created_at: datetime
    updated_at: datetime
    user: CommentUserOut
    replies: List["CommentOut"] = []


CommentOut.model_rebuild()
