from typing import Optional
from pydantic import BaseModel, ConfigDict


class TagCreate(BaseModel):
    name: str


class TagOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    post_count: int = 0
