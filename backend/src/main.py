from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from src.github_service.services.github_webhook_service import (
    GitHubWebhookService
)

from src.store.review_store import (
    ReviewStore
)

app = FastAPI(
    title="CodeGuard AI",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

webhook_service = GitHubWebhookService()


@app.get("/")
async def root():
    return {"message": "CodeGuard AI Running"}


@app.post("/api/v1/webhook/github")
async def github_webhook(request: Request):

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
