from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.dependencies import get_db, require_admin
from app.models.category import Category
from app.models.post import Post, PostStatus
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryOut
from app.utils.slug import slugify, unique_slug

router = APIRouter(prefix="/api/categories", tags=["categories"])


@router.get("", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).order_by(Category.name).all()
    result = []
    for cat in categories:
        post_count = (
            db.query(func.count(Post.id))
            .filter(Post.category_id == cat.id, Post.status == PostStatus.PUBLISHED)
            .scalar()
            or 0
        )
        out = CategoryOut.model_validate(cat)
        out.post_count = post_count
        result.append(out)
    return result


@router.post("", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(
    payload: CategoryCreate,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    if db.query(Category).filter(Category.name == payload.name).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Category already exists"
        )
    base_slug = slugify(payload.name)
    slug = unique_slug(base_slug, Category, db)
    cat = Category(name=payload.name, slug=slug, description=payload.description)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    out = CategoryOut.model_validate(cat)
    out.post_count = 0
    return out


@router.put("/{cat_id}", response_model=CategoryOut)
def update_category(
    cat_id: int,
    payload: CategoryUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    cat = db.query(Category).filter(Category.id == cat_id).first()
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    if payload.name:
        cat.name = payload.name
        cat.slug = unique_slug(slugify(payload.name), Category, db, exclude_id=cat_id)
    if payload.description is not None:
        cat.description = payload.description
    db.commit()
    db.refresh(cat)
    out = CategoryOut.model_validate(cat)
    out.post_count = (
        db.query(func.count(Post.id)).filter(Post.category_id == cat.id, Post.status == PostStatus.PUBLISHED).scalar() or 0
    )
    return out


@router.delete("/{cat_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    cat_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    cat = db.query(Category).filter(Category.id == cat_id).first()
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    db.delete(cat)
    db.commit()
