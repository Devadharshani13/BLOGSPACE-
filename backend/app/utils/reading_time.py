import re


def calculate_reading_time(content: str) -> int:
    """Calculate reading time in minutes based on ~200 WPM average."""
    # Strip HTML tags
    clean = re.sub(r"<[^>]+>", "", content)
    # Count words
    words = len(clean.split())
    # Average reading speed: 200 words per minute
    minutes = max(1, round(words / 200))
    return minutes
