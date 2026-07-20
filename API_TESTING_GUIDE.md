# API Testing Guide for Render Deployment

After deployment, you can test your CodeGuard AI backend using the following endpoints:

## Base URL
```
https://your-render-service-url
```

## Health Check
**Test if backend is running:**
```bash
curl https://your-render-service-url/
```
Expected response:
```json
{"message": "CodeGuard AI Running"}
```

## API Endpoints

### 1. Webhook Endpoint (GitHub)
**URL**: `POST /api/v1/webhook/github`

This receives events from GitHub when:
- Code is pushed to the repository
- Pull requests are created/updated
- Other webhook events occur

The webhook payload is automatically verified using `GITHUB_WEBHOOK_SECRET`.

### 2. Get Latest Review
**URL**: `GET /api/v1/reviews/latest`

Retrieve the latest code review:
```bash
curl https://your-render-service-url/api/v1/reviews/latest
```

### 3. Analyze Repository
**URL**: `POST /api/v1/analyze-repo`

Analyze a repository (provides basic analysis):
```bash
curl -X POST https://your-render-service-url/api/v1/analyze-repo \
  -H "Content-Type: application/json" \
  -d '{"repo_url": "https://github.com/owner/repo"}'
```

### 4. Get Review by PR
**URL**: `GET /api/v1/reviews?repo={repo}&pr_number={number}`

Get a specific review for a PR:
```bash
curl 'https://your-render-service-url/api/v1/reviews?repo=owner/repo&pr_number=1'
```

## Testing with Frontend
Update your frontend API configuration to point to your Render URL:

```javascript
// In your frontend config
const API_BASE_URL = "https://your-render-service-url";
```

## CORS Configuration
The backend currently allows all origins:
```python
allow_origins=["*"]
```

To restrict to your frontend domain in production:
1. Update `backend/src/main.py`
2. Set `allow_origins=["https://your-frontend-url"]`
3. Redeploy

## Testing Webhook Integration
1. Go to GitHub repo → Settings → Webhooks
2. Find your webhook
3. Click "Recent Deliveries" tab
4. Click any delivery to view:
   - Request payload
   - Response status
   - Response body

## Monitoring Logs
In Render Dashboard:
1. Select your service
2. Go to "Logs" tab
3. View real-time logs as requests come in

## Performance Tips
- Cold starts: First request after idle may take 10-30 seconds (free tier auto-spins down)
- Monitor logs for bottlenecks
- Upgrade to paid plan for persistent uptime

## Troubleshooting
- **502 Bad Gateway**: Service crashed, check logs
- **504 Gateway Timeout**: Request took too long, possibly spinning up from idle
- **401 Unauthorized on webhook**: Verify GITHUB_WEBHOOK_SECRET
- **CORS errors in frontend**: Verify CORS_ORIGINS setting
