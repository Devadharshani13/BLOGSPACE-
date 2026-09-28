from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User, UserRole
from app.core.security import verify_password, get_password_hash, create_access_token
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from app.schemas.user import UserOut


class AuthService:
    @staticmethod
    def register_user(db: Session, data: RegisterRequest) -> TokenResponse:
        existing = db.query(User).filter(User.email == data.email.lower()).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email is already registered",
            )

        new_user = User(
            name=data.name.strip(),
            email=data.email.lower(),
            password_hash=get_password_hash(data.password),
            role=UserRole.USER,
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        token = create_access_token({"sub": str(new_user.id)})
        return TokenResponse(access_token=token, user=UserOut.model_validate(new_user))

    @staticmethod
    def authenticate_user(db: Session, data: LoginRequest) -> TokenResponse:
        user = db.query(User).filter(User.email == data.email.lower()).first()
        if not user or not verify_password(data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account has been disabled. Contact support.",
            )

        token = create_access_token({"sub": str(user.id)})
        return TokenResponse(access_token=token, user=UserOut.model_validate(user))
