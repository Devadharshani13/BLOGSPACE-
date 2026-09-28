from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from app.core.dependencies import get_db, get_current_user
from app.models.like import Like
from app.models.post import Post, PostStatus
from app.models.user import User

router = APIRouter(prefix="/api/posts", tags=["likes"])


def _get_published_post(post_id: int, db: Session) -> Post:
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    return post


@router.post("/{post_id}/like")
def like_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _get_published_post(post_id, db)
    existing = db.query(Like).filter(Like.post_id == post_id, Like.user_id == current_user.id).first()
    if existing:
        count = db.query(func.count(Like.id)).filter(Like.post_id == post_id).scalar() or 0
        return {"liked": True, "like_count": count}

    like = Like(post_id=post_id, user_id=current_user.id)
    db.add(like)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
    count = db.query(func.count(Like.id)).filter(Like.post_id == post_id).scalar() or 0
    return {"liked": True, "like_count": count}


@router.delete("/{post_id}/like")
def unlike_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    like = db.query(Like).filter(Like.post_id == post_id, Like.user_id == current_user.id).first()
    if like:
        db.delete(like)
        db.commit()
    count = db.query(func.count(Like.id)).filter(Like.post_id == post_id).scalar() or 0
    return {"liked": False, "like_count": count}


@router.get("/{post_id}/likes")
def get_likes(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    count = db.query(func.count(Like.id)).filter(Like.post_id == post_id).scalar() or 0
    is_liked = db.query(Like).filter(Like.post_id == post_id, Like.user_id == current_user.id).first() is not None
    return {"like_count": count, "is_liked": is_liked}
