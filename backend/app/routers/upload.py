from fastapi import APIRouter, Depends, UploadFile, File, status
from app.core.dependencies import get_current_user
from app.models.user import User
from app.utils.upload import upload_image

router = APIRouter(prefix="/api/upload", tags=["upload"])


@router.post("/image")
async def upload_image_endpoint(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    url = await upload_image(file)
    return {"url": url, "filename": file.filename}
