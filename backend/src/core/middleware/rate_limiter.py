import time
from collections import defaultdict, deque

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from src.core.config.settings import settings
from src.core.logger.logger import AppLogger


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Simple per-IP sliding-window rate limiter."""

    def __init__(self, app):
        super().__init__(app)
        self.logger = AppLogger.get_logger(__name__)
        self._hits: dict[str, deque[float]] = defaultdict(deque)
        self._exempt_paths = {"/", "/docs", "/openapi.json", "/redoc"}

    def _client_ip(self, request: Request) -> str:
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        if request.client:
            return request.client.host
        return "unknown"

    def _is_allowed(self, key: str) -> bool:
        now = time.monotonic()
        window = settings.RATE_LIMIT_WINDOW_SECONDS
        limit = settings.RATE_LIMIT_REQUESTS
        bucket = self._hits[key]

        while bucket and now - bucket[0] > window:
            bucket.popleft()

        if len(bucket) >= limit:
            return False

        bucket.append(now)
        return True

    async def dispatch(self, request: Request, call_next):
        if request.url.path in self._exempt_paths:
            return await call_next(request)

        client_ip = self._client_ip(request)

        if not self._is_allowed(client_ip):
            self.logger.warning(
                f"Rate limit exceeded for {client_ip} "
                f"on {request.url.path}"
            )
            return JSONResponse(
                status_code=429,
                content={
                    "detail": "Too many requests. Try again later."
                },
            )

        return await call_next(request)
