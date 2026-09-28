from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.dependencies import get_db, get_current_user, require_admin
from app.models.user import User
from app.models.post import Post, PostStatus
from app.models.like import Like
from app.models.comment import Comment
from app.schemas.user import UserOut, UserUpdate, UserStats, UserAdminUpdate

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/me/stats", response_model=UserStats)
def get_my_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    total_posts = db.query(Post).filter(Post.author_id == current_user.id).count()
    published = (
        db.query(Post)
        .filter(Post.author_id == current_user.id, Post.status == PostStatus.PUBLISHED)
        .count()
    )
    drafts = total_posts - published

    # Sum likes on user's posts
    likes_result = (
        db.query(func.count(Like.id))
        .join(Post, Like.post_id == Post.id)
        .filter(Post.author_id == current_user.id)
        .scalar()
    )
    comments_result = (
        db.query(func.count(Comment.id))
        .join(Post, Comment.post_id == Post.id)
        .filter(Post.author_id == current_user.id)
        .scalar()
    )
    views_result = (
        db.query(func.sum(Post.views))
        .filter(Post.author_id == current_user.id)
        .scalar()
    )

    return UserStats(
        total_posts=total_posts,
        published_posts=published,
        drafts=drafts,
        total_likes=likes_result or 0,
        total_comments=comments_result or 0,
        total_views=views_result or 0,
    )


@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    post_count = (
        db.query(Post)
        .filter(Post.author_id == user_id, Post.status == PostStatus.PUBLISHED)
        .count()
    )
    result = UserOut.model_validate(user)
    result.post_count = post_count
    return result


@router.put("/profile", response_model=UserOut)
def update_profile(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.name is not None:
        current_user.name = payload.name.strip()
    if payload.bio is not None:
        current_user.bio = payload.bio
    if payload.profile_image is not None:
        current_user.profile_image = payload.profile_image
    db.commit()
    db.refresh(current_user)
    return UserOut.model_validate(current_user)
