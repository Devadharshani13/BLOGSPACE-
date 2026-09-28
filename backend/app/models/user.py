import enum
from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.database import Base


class UserRole(str, enum.Enum):
    USER = "USER"
    ADMIN = "ADMIN"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    profile_image = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    role = Column(Enum(UserRole), default=UserRole.USER, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    posts = relationship("Post", back_populates="author", cascade="all, delete-orphan")
    comments = relationship(
        "Comment", back_populates="user", cascade="all, delete-orphan"
    )
    likes = relationship("Like", back_populates="user", cascade="all, delete-orphan")
    bookmarks = relationship(
        "Bookmark", back_populates="user", cascade="all, delete-orphan"
    )
