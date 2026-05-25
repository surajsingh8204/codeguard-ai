import hashlib
import hmac

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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

app = FastAPI(
    title="CodeGuard AI",
    version="1.0.0"
)

def _verify_github_signature(raw_body, headers):

    secret = settings.GITHUB_WEBHOOK_SECRET

    if not secret:
        return True

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


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

webhook_service = GitHubWebhookService()
repo_analyzer = RepoAnalyzer()


class RepoRequest(BaseModel):

    repo_url: str


@app.get("/")
async def root():
    return {"message": "CodeGuard AI Running"}


@app.post("/api/v1/webhook/github")
async def github_webhook(request: Request):

    raw_body = await request.body()

    if not _verify_github_signature(
        raw_body,
        request.headers
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid webhook signature"
        )

    payload = await request.json()
    headers = request.headers

    return await webhook_service.handle_webhook(
        payload,
        headers
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

    reviews = repo_analyzer.analyze_repository(
        request.repo_url
    )

    return {
        "reviews": reviews
    }


@app.get("/api/v1/reviews")
async def review_by_pr(repo: str, pr_number: int):

    review = webhook_service.get_review(
        repo,
        pr_number
    )

    if not review:
        return {
            "message": "Review not found"
        }

    return review
