# Render Deployment Guide for CodeGuard AI Backend

## Overview
This guide walks you through deploying the CodeGuard AI backend on Render's free tier.

## Prerequisites
- Render account (free tier available at https://render.com)
- GitHub repository with your code
- API keys for:
  - Groq API
  - Gemini API
  - GitHub Personal Access Token
  - GitHub Webhook Secret

## Step 1: Prepare Your Repository
All configuration files are already created:
- ✅ `Procfile` - Tells Render how to run your app
- ✅ `render.yaml` - Deployment configuration
- ✅ `build.sh` - Build script
- ✅ `.env.example` - Environment variables template

Ensure these files are committed to your GitHub repository:
```bash
git add Procfile render.yaml build.sh .env.example
git commit -m "Add Render deployment configuration"
git push
```

## Step 2: Create a Render Account
1. Go to https://render.com
2. Sign up with your GitHub account (recommended for easier integration)
3. Authorize Render to access your GitHub repositories

## Step 3: Deploy on Render

### Option A: Deploy from render.yaml (Recommended)
1. Go to Render Dashboard: https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository with CodeGuard AI
4. Select the repository
5. Render will automatically detect `render.yaml`
6. Review the settings and click "Create Web Service"

### Option B: Deploy Manually
1. Go to Render Dashboard: https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Fill in the configuration:
   - **Name**: `codeguard-ai-backend`
   - **Environment**: Python
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your deployment branch)
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn src.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free (or higher if needed)
5. Click "Create Web Service"

## Step 4: Configure Environment Variables
1. In Render Dashboard, go to your service settings
2. Navigate to "Environment" tab
3. Add the following environment variables:
   - `GROQ_API_KEY` - Your Groq API key
   - `GEMINI_API_KEY` - Your Gemini API key
   - `GITHUB_TOKEN` - Your GitHub Personal Access Token
   - `GITHUB_WEBHOOK_SECRET` - Your webhook secret
   - `CORS_ORIGINS` - Set to `*` or your frontend URL

**Important**: Never commit `.env` files with real keys to GitHub!

## Step 5: Set Up GitHub Webhook
1. In Render Dashboard, copy your service URL (format: `https://codeguard-ai-backend-xxxxx.onrender.com`)
2. Go to your GitHub repository → Settings → Webhooks
3. Click "Add webhook"
4. Fill in:
   - **Payload URL**: `https://your-render-url/api/v1/webhook/github`
   - **Content type**: `application/json`
   - **Secret**: Use the same `GITHUB_WEBHOOK_SECRET` configured in Render
   - **Events**: Select "Push events" and "Pull request events"
   - **Active**: ✓ Check this box
5. Click "Add webhook"

## Step 6: Test Your Deployment
1. Wait for the deployment to complete (check "Logs" tab)
2. Once live, visit: `https://your-render-url/`
3. You should see: `{"message": "CodeGuard AI Running"}`
4. Test the webhook by creating a test PR in your repository

## Free Tier Limitations
- **Memory**: 512 MB (adequate for this backend)
- **CPU**: 0.5 CPU
- **Uptime**: Services spin down after 15 minutes of inactivity
- **Cold starts**: First request after idle period may be slower
- **Upgrade options**: Available if you need persistent uptime

## Useful Links
- Service Dashboard: https://dashboard.render.com
- API Status: https://status.render.com
- Documentation: https://render.com/docs

## Troubleshooting

### Deployment Fails
1. Check "Logs" tab for error messages
2. Verify Python version compatibility
3. Ensure all dependencies in `requirements.txt` are installable

### Service Spins Down
- Free tier services auto-spin-down after 15 minutes of inactivity
- Consider upgrading to a paid plan for persistent uptime

### Webhook Not Working
1. Verify the webhook URL is correct in GitHub settings
2. Check "Recent Deliveries" in GitHub webhook settings for errors
3. Verify `GITHUB_WEBHOOK_SECRET` matches in both GitHub and Render

### API Key Issues
1. Ensure API keys are valid and active
2. Check for any rate limiting from the API providers
3. Verify environment variables are set correctly in Render

## Monitoring and Logs
- Render provides real-time logs in the Dashboard
- Monitor your service health and error rates
- Set up notifications for deployment failures (Pro feature)

---

**Note**: Keep your API keys secure. Never expose them in your code or commit them to Git. Always use Render's environment variable system for sensitive data.
