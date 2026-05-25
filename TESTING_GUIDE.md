# CodeGuard AI Testing Guide

## Demo URLs

- Frontend: <FRONTEND_URL>
- Backend: <BACKEND_URL>

## Option A: GitHub PR Webhook (Recommended)

1. Fork the demo repo: https://github.com/surajsingh8204/ai-review-test
2. Create a new branch and make a small change (for example, add a comment in app.py).
3. Open a pull request back to the original repo.
4. Wait for the bot comment to appear on the PR.
5. Open the frontend dashboard and confirm the latest review appears.

## Option B: Repo URL Analysis (No Webhook)

1. Open the frontend dashboard.
2. Paste a public GitHub repository URL into the input.
3. Click Analyze Repository.
4. Review the findings in the dashboard.

## Notes

- Webhooks trigger on pull_request opened and synchronize events.
- If webhook testing is not possible, Option B still demonstrates the full analysis pipeline.
- For local testing, set VITE_API_URL to http://127.0.0.1:80.
