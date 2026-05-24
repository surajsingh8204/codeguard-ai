from fastapi import FastAPI, Request

from src.github_service.services.github_webhook_service import (
    GitHubWebhookService
)

app = FastAPI(
    title="CodeGuard AI",
    version="1.0.0"
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