import re
from sqlalchemy.orm import Session


def slugify(text: str) -> str:
    """Convert text to URL-friendly slug."""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    text = re.sub(r"^-+|-+$", "", text)
    return text


def unique_slug(base_slug: str, model, db: Session, exclude_id: int = None) -> str:
    """Generate a unique slug by appending a counter if needed."""
    slug = base_slug
    counter = 1
    while True:
        query = db.query(model).filter(model.slug == slug)
        if exclude_id:
            query = query.filter(model.id != exclude_id)
        existing = query.first()
        if not existing:
            return slug
        slug = f"{base_slug}-{counter}"
        counter += 1
