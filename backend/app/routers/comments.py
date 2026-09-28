from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.core.dependencies import get_db, get_current_user, get_optional_user
from app.models.comment import Comment
from app.models.post import Post
from app.models.user import User
from app.schemas.comment import CommentCreate, CommentOut

router = APIRouter(tags=["comments"])


def _build_comment_out(comment: Comment) -> CommentOut:
    return CommentOut(
        id=comment.id,
        post_id=comment.post_id,
        user_id=comment.user_id,
        parent_id=comment.parent_id,
        content=comment.content,
        created_at=comment.created_at,
        updated_at=comment.updated_at,
        user=comment.user,
        replies=[_build_comment_out(r) for r in comment.replies if r],
    )


@router.get("/api/posts/{post_id}/comments", response_model=list[CommentOut])
def get_comments(
    post_id: int,
    db: Session = Depends(get_db),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    # Fetch top-level comments (no parent) with eager loaded relationships
    comments = (
        db.query(Comment)
        .options(
            joinedload(Comment.user),
            joinedload(Comment.replies).joinedload(Comment.user),
        )
        .filter(Comment.post_id == post_id, Comment.parent_id == None)
        .order_by(Comment.created_at.asc())
        .all()
    )
    return [_build_comment_out(c) for c in comments]


@router.post("/api/posts/{post_id}/comments", response_model=CommentOut, status_code=status.HTTP_201_CREATED)
def add_comment(
    post_id: int,
    payload: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    if payload.parent_id:
        parent = db.query(Comment).filter(Comment.id == payload.parent_id, Comment.post_id == post_id).first()
        if not parent:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parent comment not found")

    comment = Comment(
        post_id=post_id,
        user_id=current_user.id,
        parent_id=payload.parent_id,
        content=payload.content.strip(),
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    # Reload with relationships
    comment = (
        db.query(Comment)
        .options(joinedload(Comment.user), joinedload(Comment.replies).joinedload(Comment.user))
        .filter(Comment.id == comment.id)
        .first()
    )
    return _build_comment_out(comment)


@router.delete("/api/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
    if comment.user_id != current_user.id and current_user.role.value != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    db.delete(comment)
    db.commit()
