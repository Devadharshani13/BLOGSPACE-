from pydantic_settings import BaseSettings
from pydantic import computed_field
from typing import Optional
import os


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/blogspace"
    SECRET_KEY: str = "super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    FRONTEND_URL: str = "http://localhost:5173"
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE: int = 5242880  # 5 MB

    CLOUDINARY_CLOUD_NAME: Optional[str] = None
    CLOUDINARY_API_KEY: Optional[str] = None
    CLOUDINARY_API_SECRET: Optional[str] = None

    @computed_field
    @property
    def USE_CLOUDINARY(self) -> bool:
        return bool(
            self.CLOUDINARY_CLOUD_NAME
            and self.CLOUDINARY_API_KEY
            and self.CLOUDINARY_API_SECRET
        )

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
