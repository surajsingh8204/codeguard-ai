import hashlib
import time
from threading import Lock
from typing import Any, Optional

from src.core.config.settings import settings


class ReviewStore:
    """In-memory review store with TTL cache for analyze-repo."""

    latest_review = None
    _cache: dict[str, tuple[float, Any]] = {}
    _lock = Lock()

    @classmethod
    def save_review(cls, review):
        cls.latest_review = review

    @classmethod
    def get_review(cls):
        return cls.latest_review

    @classmethod
    def cache_key(cls, repo_url: str) -> str:
        normalized = repo_url.strip().rstrip("/").lower()
        return hashlib.sha256(
            normalized.encode("utf-8")
        ).hexdigest()

    @classmethod
    def get_cached(cls, repo_url: str) -> Optional[Any]:
        key = cls.cache_key(repo_url)
        now = time.monotonic()

        with cls._lock:
            entry = cls._cache.get(key)
            if not entry:
                return None

            expires_at, value = entry
            if now >= expires_at:
                del cls._cache[key]
                return None

            return value

    @classmethod
    def set_cached(cls, repo_url: str, value: Any) -> None:
        key = cls.cache_key(repo_url)
        expires_at = (
            time.monotonic() + settings.REVIEW_CACHE_TTL_SECONDS
        )

        with cls._lock:
            cls._prune_locked()
            cls._cache[key] = (expires_at, value)

    @classmethod
    def _prune_locked(cls) -> None:
        now = time.monotonic()
        expired = [
            key
            for key, (expires_at, _) in cls._cache.items()
            if now >= expires_at
        ]
        for key in expired:
            del cls._cache[key]
