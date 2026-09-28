from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    description: Optional[str] = None
    post_count: int = 0
    created_at: datetime
