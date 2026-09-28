from app.database.database import Base  # noqa: F401

# Import all models so they register with Base.metadata
from app.models.user import User  # noqa: F401, E402
from app.models.category import Category  # noqa: F401, E402
from app.models.tag import Tag, post_tags  # noqa: F401, E402
from app.models.post import Post  # noqa: F401, E402
from app.models.comment import Comment  # noqa: F401, E402
from app.models.like import Like  # noqa: F401, E402
from app.models.bookmark import Bookmark  # noqa: F401, E402
