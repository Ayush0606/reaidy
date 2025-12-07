# Quick Setup Guide

## Prerequisites Check
- [ ] Node.js v18+ installed
- [ ] MongoDB installed or Atlas account ready
- [ ] Gemini API key obtained

## Step-by-Step Setup

### 1. Install Backend Dependencies
```powershell
cd backend
npm install
```

### 2. Configure Backend Environment
```powershell
# Copy example environment file
Copy-Item .env.example .env

# Edit .env file with your settings
notepad .env
```

**Required Configuration:**
- `MONGO_URI`: Your MongoDB connection string
- `JWT_SECRET`: Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `AI_API_KEY`: Your Gemini API key from https://makersuite.google.com/app/apikey

### 3. Install Frontend Dependencies
```powershell
cd ..\frontend
npm install
```

### 4. Start MongoDB
```powershell
# If using local MongoDB
net start MongoDB

# Or use Docker
cd ..
docker-compose up mongodb -d
```

### 5. Start Backend Server
```powershell
cd backend
npm run dev
```
✅ Backend should be running on http://localhost:5000

### 6. Start Frontend (New Terminal)
```powershell
cd frontend
npm run dev
```
✅ Frontend should be running on http://localhost:3000

### 7. Test the Application
1. Open browser to http://localhost:3000
2. Register a new account
3. Login with your credentials
4. Upload the sample CSV: `sample-transactions.csv`
5. Set a budget for the current month
6. Click "AI Analyze" on the dashboard

## Verification Steps

### Test Backend API
```powershell
# Health check
curl http://localhost:5000/health
```

### Test Authentication
```powershell
# Register user
curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"password123\"}'
```

### Run Tests
```powershell
cd backend
npm test
```

## Common Issues & Solutions

### Issue: MongoDB Connection Failed
**Error:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solutions:**
1. Check if MongoDB is running: `Get-Service MongoDB`
2. Verify MONGO_URI in `.env`
3. For Atlas: Check IP whitelist settings

### Issue: Port Already in Use
**Error:** `EADDRINUSE: address already in use :::5000`

**Solutions:**
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

### Issue: JWT Token Invalid
**Error:** `Invalid token`

**Solutions:**
1. Clear browser localStorage
2. Logout and login again
3. Check JWT_SECRET is set in `.env`

### Issue: AI Analysis Fails
**Error:** `AI API key not configured`

**Solutions:**
1. Get API key from https://makersuite.google.com/app/apikey
2. Add to `.env`: `AI_API_KEY=your_key_here`
3. Restart backend server

## Development Tips

### Hot Reload
- Backend: Uses `nodemon` - auto-restarts on file changes
- Frontend: Uses Vite - instant hot module replacement

### Database GUI Tools
- MongoDB Compass (recommended)
- Studio 3T
- NoSQLBooster

### API Testing Tools
- Postman
- Thunder Client (VS Code extension)
- curl commands

### Debugging
- Backend: Add `console.log()` or use VS Code debugger
- Frontend: Use React DevTools browser extension
- Network: Check browser DevTools Network tab

## Next Steps

1. **Customize Categories**: Edit `backend/src/utils/categoryUtils.js`
2. **Adjust AI Prompts**: Modify `backend/src/services/aiService.js`
3. **Change UI Theme**: Update `frontend/tailwind.config.js`
4. **Add Features**: Follow the modular structure

## Production Deployment Checklist

- [ ] Set `NODE_ENV=production` in backend
- [ ] Use strong JWT_SECRET (64+ characters)
- [ ] Enable MongoDB authentication
- [ ] Set up HTTPS/SSL
- [ ] Configure CORS for production domain
- [ ] Set rate limiting on API endpoints
- [ ] Enable MongoDB backups
- [ ] Set up error monitoring (e.g., Sentry)
- [ ] Configure CDN for frontend assets
- [ ] Set up CI/CD pipeline

## Need Help?

- Check the main README.md for detailed documentation
- Review API endpoints in backend routes
- Inspect browser console for frontend errors
- Check backend logs for server errors

---

🎉 **You're all set! Start building amazing financial insights with AI!**
