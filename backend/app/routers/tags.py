from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.dependencies import get_db, get_current_user
from app.models.tag import Tag
from app.models.post import Post, PostStatus
from app.schemas.tag import TagCreate, TagOut
from app.utils.slug import slugify

router = APIRouter(prefix="/api/tags", tags=["tags"])


@router.get("", response_model=list[TagOut])
def list_tags(db: Session = Depends(get_db)):
    tags = db.query(Tag).order_by(Tag.name).all()
    result = []
    for tag in tags:
        post_count = len([p for p in tag.posts if p.status == PostStatus.PUBLISHED])
        out = TagOut.model_validate(tag)
        out.post_count = post_count
        result.append(out)
    return result


@router.post("", response_model=TagOut, status_code=status.HTTP_201_CREATED)
def create_tag(
    payload: TagCreate,
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
):
    slug = slugify(payload.name.strip())
    existing = db.query(Tag).filter(Tag.slug == slug).first()
    if existing:
        out = TagOut.model_validate(existing)
        out.post_count = 0
        return out
    tag = Tag(name=payload.name.strip(), slug=slug)
    db.add(tag)
    db.commit()
    db.refresh(tag)
    out = TagOut.model_validate(tag)
    out.post_count = 0
    return out
