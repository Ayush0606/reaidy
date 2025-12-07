# Deployment Guide

This guide covers deploying the AI Personal Finance Advisor to various cloud platforms.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Docker Deployment](#docker-deployment)
- [Post-Deployment](#post-deployment)

---

## Prerequisites

- Git repository with your code
- MongoDB database (local or cloud)
- Gemini API key
- Domain name (optional)

---

## Environment Variables

### Backend (.env)
```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-finance?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_min_64_chars_recommended
JWT_EXPIRES_IN=7d
AI_PROVIDER_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
AI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=https://your-frontend-domain.com
NODE_ENV=production
```

### Frontend (.env)
```env
VITE_API_URL=https://your-backend-domain.com/api
```

---

## Database Setup

### MongoDB Atlas (Recommended)

1. **Create Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free tier

2. **Create Cluster**
   - Click "Build a Database"
   - Choose "Shared" (Free)
   - Select region closest to your users
   - Create cluster

3. **Configure Access**
   - Database Access: Create user with password
   - Network Access: Add IP address (0.0.0.0/0 for all IPs or specific IPs)

4. **Get Connection String**
   - Click "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your password

5. **Create Database**
   - Collections will be created automatically
   - Database name: `ai-finance`

---

## Backend Deployment

### Option 1: Railway

**Steps:**
1. Sign up at https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Configure:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add environment variables from Settings → Variables
6. Deploy automatically on push

**Custom Domain:**
- Settings → Networking → Generate Domain or add custom domain

### Option 2: Render

**Steps:**
1. Sign up at https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - Name: `ai-finance-backend`
   - Root Directory: `backend`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add environment variables
6. Create Web Service

**Custom Domain:**
- Settings → Custom Domains

### Option 3: Heroku

**Steps:**
1. Install Heroku CLI
2. Login: `heroku login`
3. Create app:
```bash
cd backend
heroku create ai-finance-backend
```

4. Add buildpack:
```bash
heroku buildpacks:set heroku/nodejs
```

5. Set environment variables:
```bash
heroku config:set MONGO_URI="your_mongo_uri"
heroku config:set JWT_SECRET="your_jwt_secret"
heroku config:set AI_API_KEY="your_api_key"
heroku config:set NODE_ENV=production
```

6. Deploy:
```bash
git subtree push --prefix backend heroku main
# OR if not using subtree:
git push heroku main
```

### Option 4: DigitalOcean App Platform

**Steps:**
1. Sign up at https://cloud.digitalocean.com
2. Apps → Create App
3. Connect GitHub repository
4. Configure:
   - Source Directory: `backend`
   - Type: Web Service
   - Build Command: `npm install`
   - Run Command: `npm start`
5. Add environment variables
6. Launch app

---

## Frontend Deployment

### Option 1: Vercel (Recommended)

**Steps:**
1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy:
```bash
cd frontend
vercel
```

4. Configure:
   - Framework Preset: Vite
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`

5. Add environment variable:
   - Dashboard → Settings → Environment Variables
   - Add `VITE_API_URL`

6. Redeploy: `vercel --prod`

**Custom Domain:**
- Dashboard → Settings → Domains

### Option 2: Netlify

**Steps:**
1. Sign up at https://netlify.com
2. Sites → Add new site → Import from Git
3. Connect repository
4. Configure:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
5. Add environment variables in Site settings
6. Deploy site

**Custom Domain:**
- Site settings → Domain management

### Option 3: Cloudflare Pages

**Steps:**
1. Sign up at https://pages.cloudflare.com
2. Create application → Connect to Git
3. Configure:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `frontend`
4. Environment variables: Add `VITE_API_URL`
5. Save and deploy

---

## Docker Deployment

### Build and Run Locally

**Build Images:**
```bash
# Backend
cd backend
docker build -t ai-finance-backend .

# Frontend
cd ../frontend
docker build -t ai-finance-frontend .
```

**Run Containers:**
```bash
# Backend
docker run -d \
  -p 5000:5000 \
  -e MONGO_URI="your_mongo_uri" \
  -e JWT_SECRET="your_secret" \
  -e AI_API_KEY="your_key" \
  --name backend \
  ai-finance-backend

# Frontend
docker run -d \
  -p 80:80 \
  --name frontend \
  ai-finance-frontend
```

### Docker Compose

**Production docker-compose.yml:**
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGO_URI=${MONGO_URI}
      - JWT_SECRET=${JWT_SECRET}
      - AI_API_KEY=${AI_API_KEY}
      - NODE_ENV=production
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

**Deploy:**
```bash
docker-compose up -d
```

### Deploy to Cloud with Docker

#### AWS ECS
1. Push images to ECR
2. Create ECS cluster
3. Define task definitions
4. Create service
5. Configure load balancer

#### Google Cloud Run
```bash
# Backend
gcloud builds submit --tag gcr.io/PROJECT-ID/backend
gcloud run deploy backend --image gcr.io/PROJECT-ID/backend

# Frontend
gcloud builds submit --tag gcr.io/PROJECT-ID/frontend
gcloud run deploy frontend --image gcr.io/PROJECT-ID/frontend
```

#### Azure Container Instances
```bash
az container create \
  --resource-group myResourceGroup \
  --name ai-finance-backend \
  --image your-registry/backend:latest \
  --cpu 1 --memory 1 \
  --ports 5000
```

---

## Post-Deployment

### 1. Test Application

**Backend Health Check:**
```bash
curl https://your-backend.com/health
```

**Test Authentication:**
```bash
curl -X POST https://your-backend.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123"}'
```

### 2. Monitor Application

**Tools:**
- **Logging**: Papertrail, Loggly
- **Error Tracking**: Sentry, Rollbar
- **Performance**: New Relic, Datadog
- **Uptime**: UptimeRobot, Pingdom

**Add Sentry (Example):**
```javascript
// Backend
import * as Sentry from "@sentry/node";
Sentry.init({ dsn: process.env.SENTRY_DSN });

// Frontend
import * as Sentry from "@sentry/react";
Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN });
```

### 3. Set Up CI/CD

**GitHub Actions (.github/workflows/deploy.yml):**
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        run: |
          # Your deployment script
          
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: |
          # Your deployment script
```

### 4. Set Up Backups

**MongoDB Atlas:**
- Automatic backups enabled by default
- Configure retention period
- Test restore process

**Manual Backup Script:**
```bash
#!/bin/bash
mongodump --uri="$MONGO_URI" --out=/backup/$(date +%Y%m%d)
```

### 5. Configure SSL/HTTPS

Most platforms provide automatic SSL:
- Vercel: Automatic
- Netlify: Automatic
- Railway: Automatic
- Render: Automatic

**Custom Domain SSL:**
- Use Let's Encrypt
- Configure in platform settings

### 6. Set Up CDN (Optional)

**Cloudflare:**
1. Add site to Cloudflare
2. Update nameservers
3. Enable caching
4. Configure security rules

### 7. Performance Optimization

**Backend:**
- Enable gzip compression
- Add response caching
- Optimize database queries
- Use Redis for sessions

**Frontend:**
- Enable asset compression
- Optimize images
- Lazy load components
- Use CDN for assets

### 8. Security Checklist

- [ ] HTTPS enabled
- [ ] Strong JWT secret (64+ chars)
- [ ] MongoDB authentication enabled
- [ ] Environment variables secured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] Dependencies updated
- [ ] Security headers configured

### 9. Monitoring Checklist

- [ ] Uptime monitoring
- [ ] Error tracking
- [ ] Performance monitoring
- [ ] Database monitoring
- [ ] Log aggregation
- [ ] Alert notifications

---

## Troubleshooting

### Backend Won't Start
- Check environment variables
- Verify MongoDB connection
- Check logs for errors
- Ensure port is available

### Frontend Can't Connect to Backend
- Verify API URL is correct
- Check CORS configuration
- Ensure backend is running
- Check network/firewall rules

### Database Connection Issues
- Verify connection string
- Check IP whitelist in MongoDB Atlas
- Ensure network access configured
- Test connection locally

### AI Analysis Fails
- Verify API key is correct
- Check API rate limits
- Ensure proper error handling
- Review API request format

---

## Cost Estimation

### Free Tier Options
- **Backend**: Railway/Render (500 hrs/month)
- **Frontend**: Vercel/Netlify (unlimited)
- **Database**: MongoDB Atlas (512 MB)
- **Total**: $0/month

### Paid Tier (Small App)
- **Backend**: $7-15/month
- **Frontend**: $0-20/month
- **Database**: $0-10/month
- **Monitoring**: $0-25/month
- **Total**: ~$15-70/month

---

## Support

- Check logs first
- Review environment variables
- Test locally with production settings
- Consult platform documentation
- Create issue on GitHub

---

**Happy Deploying!** 🚀
