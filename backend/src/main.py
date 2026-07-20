import hashlib
import hmac
import json

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

from src.github_service.services.github_webhook_service import (
    GitHubWebhookService
)

from src.store.review_store import (
    ReviewStore
)

from src.repository.repo_analyzer import (
    RepoAnalyzer
)

from src.core.config.settings import (
    settings
)

from src.core.middleware.rate_limiter import (
    RateLimitMiddleware
)

from src.core.logger.logger import (
    AppLogger
)

from src.schemas.repo_schema import (
    RepoRequest,
    validate_repo_key
)

app = FastAPI(
    title="CodeGuard AI",
    version="1.0.0"
)

logger = AppLogger.get_logger(__name__)


def _verify_github_signature(raw_body, headers):

    secret = settings.GITHUB_WEBHOOK_SECRET

    if not secret:
        if settings.ALLOW_INSECURE_WEBHOOKS:
            logger.warning(
                "Webhook signature check skipped "
                "(ALLOW_INSECURE_WEBHOOKS=true)"
            )
            return True

        logger.error(
            "GITHUB_WEBHOOK_SECRET is not configured"
        )
        return False

    signature = headers.get("X-Hub-Signature-256")

    if not signature:
        return False

    digest = hmac.new(
        secret.encode("utf-8"),
        raw_body,
        hashlib.sha256
    ).hexdigest()

    expected = f"sha256={digest}"

    return hmac.compare_digest(signature, expected)


cors_origins = settings.cors_origins_list()

if cors_origins == ["*"]:
    logger.warning(
        "CORS is configured to allow all origins (*). "
        "Restrict CORS_ORIGINS in production."
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Requested-With"],
)

app.add_middleware(RateLimitMiddleware)

webhook_service = GitHubWebhookService()
repo_analyzer = RepoAnalyzer()


@app.get("/")
async def root():
    return {"message": "CodeGuard AI Running"}


@app.post("/api/v1/webhook/github")
async def github_webhook(request: Request):

    raw_body = await request.body()

    if len(raw_body) > settings.MAX_WEBHOOK_BODY_BYTES:
        raise HTTPException(
            status_code=413,
            detail="Webhook payload too large"
        )

    if not _verify_github_signature(
        raw_body,
        request.headers
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid webhook signature"
        )

    try:
        payload = json.loads(raw_body.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        raise HTTPException(
            status_code=400,
            detail="Invalid webhook JSON payload"
        )

    if not isinstance(payload, dict):
        raise HTTPException(
            status_code=400,
            detail="Webhook payload must be a JSON object"
        )

    return await webhook_service.handle_webhook(
        payload,
        request.headers
    )


@app.get("/api/v1/reviews/latest")
async def latest_review():

    return {
        "data": ReviewStore.get_review(),
        "latest": webhook_service.get_latest_review()
    }


@app.post("/api/v1/analyze-repo")
async def analyze_repo(
    request: RepoRequest
):

    cached = ReviewStore.get_cached(request.repo_url)

    if cached is not None:
        logger.info(
            f"Returning cached analysis for {request.repo_url}"
        )
        return {
            "reviews": cached,
            "cached": True
        }

    reviews = repo_analyzer.analyze_repository(
        request.repo_url
    )

    ReviewStore.set_cached(request.repo_url, reviews)
    ReviewStore.save_review(reviews)

    return {
        "reviews": reviews,
        "cached": False
    }


@app.get("/api/v1/reviews")
async def review_by_pr(repo: str, pr_number: int):

    try:
        validated_repo = validate_repo_key(repo)
    except ValueError as exc:
        raise HTTPException(
            status_code=422,
            detail=str(exc)
        )

    if pr_number < 1:
        raise HTTPException(
            status_code=422,
            detail="pr_number must be a positive integer"
        )

    review = webhook_service.get_review(
        validated_repo,
        pr_number
    )

    if not review:
        return {
            "message": "Review not found"
        }

    return review
