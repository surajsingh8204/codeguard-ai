# Render Deployment Checklist

## Pre-Deployment (Do Once)
- [ ] Commit all configuration files:
  - [ ] `backend/Procfile`
  - [ ] `backend/render.yaml`
  - [ ] `backend/build.sh`
  - [ ] `backend/.env.example` (updated)
- [ ] Push to GitHub main/master branch
- [ ] Create Render account at https://render.com
- [ ] Connect GitHub account to Render

## Deployment (Step-by-Step)
1. **Create Web Service**
   - [ ] Go to Render Dashboard → "New +" → "Web Service"
   - [ ] Connect your CodeGuard AI GitHub repository
   - [ ] Render auto-detects render.yaml

2. **Configure Service**
   - [ ] Service Name: `codeguard-ai-backend`
   - [ ] Python version: 3.11
   - [ ] Branch: `main`

3. **Set Environment Variables**
   - [ ] `GROQ_API_KEY` → Get from [https://console.groq.com](https://console.groq.com)
   - [ ] `GEMINI_API_KEY` → Get from [https://aistudio.google.com](https://aistudio.google.com)
   - [ ] `GITHUB_TOKEN` → Create in GitHub Settings → Developer Settings → Personal Access Tokens
   - [ ] `GITHUB_WEBHOOK_SECRET` → Create a secure random string
   - [ ] `CORS_ORIGINS` → `*` or your frontend domain

4. **Deploy**
   - [ ] Click "Create Web Service"
   - [ ] Wait for deployment to complete (check Logs)
   - [ ] Verify with: `https://your-service-url/` returns `{"message": "CodeGuard AI Running"}`

5. **Setup GitHub Webhook**
   - [ ] Copy your Render service URL from Dashboard
   - [ ] Go to GitHub repo → Settings → Webhooks → Add webhook
   - [ ] Payload URL: `https://your-render-url/api/v1/webhook/github`
   - [ ] Content type: `application/json`
   - [ ] Secret: Use same value as `GITHUB_WEBHOOK_SECRET` in Render
   - [ ] Events: Push events + Pull request events
   - [ ] Active: ✓

6. **Test**
   - [ ] Create a test PR to verify webhook works
   - [ ] Check Render logs for webhook handling
   - [ ] Monitor service health on Render Dashboard

## Post-Deployment
- [ ] Monitor logs for errors
- [ ] Test API endpoints
- [ ] Verify webhook deliveries in GitHub
- [ ] Set up monitoring/alerts (if using paid plan)

## Useful Resources
- **Render Dashboard**: https://dashboard.render.com
- **API Key Management**:
  - Groq: https://console.groq.com
  - Gemini: https://aistudio.google.com
  - GitHub: https://github.com/settings/personal-access-tokens
- **Full Guide**: See `RENDER_DEPLOYMENT_GUIDE.md`

## Quick Commands
```bash
# Commit deployment files
git add backend/Procfile backend/render.yaml backend/build.sh backend/.env.example .gitignore
git commit -m "Add Render deployment configuration"
git push

# Check your deployed service
curl https://your-render-url/
```

## Support
- Render Docs: https://render.com/docs
- Render Status: https://status.render.com
