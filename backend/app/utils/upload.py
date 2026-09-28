import os
import uuid
from typing import Optional
from fastapi import UploadFile, HTTPException, status
from PIL import Image
import io
from app.core.config import settings

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


async def save_upload_locally(file: UploadFile) -> str:
    """Save uploaded file to local uploads directory and return URL path."""
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_CONTENT_TYPES)}",
        )

    contents = await file.read()

    if len(contents) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {settings.MAX_UPLOAD_SIZE // 1024 // 1024}MB",
        )

    # Validate it's actually an image
    try:
        img = Image.open(io.BytesIO(contents))
        img.verify()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image file",
        )

    ext = os.path.splitext(file.filename or "image.jpg")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        ext = ".jpg"

    filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)

    with open(file_path, "wb") as f:
        f.write(contents)

    return f"/uploads/{filename}"


async def upload_image(file: UploadFile) -> str:
    """Upload image - uses Cloudinary if configured, else local storage."""
    if settings.USE_CLOUDINARY:
        return await upload_to_cloudinary(file)
    return await save_upload_locally(file)


async def upload_to_cloudinary(file: UploadFile) -> str:
    """Upload image to Cloudinary."""
    try:
        import cloudinary
        import cloudinary.uploader

        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
        )

        contents = await file.read()
        result = cloudinary.uploader.upload(
            contents,
            folder="blogspace",
            resource_type="image",
        )
        return result["secure_url"]
    except ImportError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Cloudinary package not installed. Run: pip install cloudinary",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Cloudinary upload failed: {str(e)}",
        )
