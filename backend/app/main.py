from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.database.database import engine
from app.database import base  # noqa: F401 — triggers model registration

from app.routers import auth, users, posts, categories, tags, likes, bookmarks, comments, upload, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables on startup
    from app.database.base import Base
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="BlogSpace API",
    description="Full-stack blogging platform API — Discover. Write. Share.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(posts.router)
app.include_router(categories.router)
app.include_router(tags.router)
app.include_router(likes.router)
app.include_router(bookmarks.router)
app.include_router(comments.router)
app.include_router(upload.router)
app.include_router(admin.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "BlogSpace API"}


# Custom exception handlers
@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(status_code=404, content={"detail": "Resource not found"})


@app.exception_handler(500)
async def server_error_handler(request: Request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please try again later."},
    )
