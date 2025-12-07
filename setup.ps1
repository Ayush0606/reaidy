# AI Personal Finance Advisor - Quick Start

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "AI Personal Finance Advisor - Quick Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check MongoDB
Write-Host "`nChecking MongoDB..." -ForegroundColor Yellow
$mongoRunning = Get-Service -Name MongoDB -ErrorAction SilentlyContinue
if ($mongoRunning -and $mongoRunning.Status -eq 'Running') {
    Write-Host "✓ MongoDB is running" -ForegroundColor Green
} else {
    Write-Host "⚠ MongoDB not detected. Make sure MongoDB is installed and running." -ForegroundColor Yellow
    Write-Host "  Or use MongoDB Atlas: https://www.mongodb.com/cloud/atlas" -ForegroundColor Yellow
}

# Install backend dependencies
Write-Host "`n[1/4] Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
if (Test-Path ".env") {
    Write-Host "✓ Backend .env file exists" -ForegroundColor Green
} else {
    Write-Host "⚠ Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✓ Please edit backend/.env with your configuration!" -ForegroundColor Yellow
}
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}

# Install frontend dependencies
Write-Host "`n[2/4] Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location ..\frontend
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}

Set-Location ..

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan

Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "1. Edit backend/.env with your configuration:" -ForegroundColor White
Write-Host "   - MONGO_URI (MongoDB connection string)" -ForegroundColor Gray
Write-Host "   - JWT_SECRET (generate with: node -e ""console.log(require('crypto').randomBytes(32).toString('hex'))"")" -ForegroundColor Gray
Write-Host "   - AI_API_KEY (get from https://makersuite.google.com/app/apikey)" -ForegroundColor Gray

Write-Host "`n2. Start the application:" -ForegroundColor White
Write-Host "   Terminal 1: cd backend && npm run dev" -ForegroundColor Gray
Write-Host "   Terminal 2: cd frontend && npm run dev" -ForegroundColor Gray

Write-Host "`n3. Open your browser:" -ForegroundColor White
Write-Host "   http://localhost:3000" -ForegroundColor Gray

Write-Host "`n4. (Optional) Upload sample data:" -ForegroundColor White
Write-Host "   Use sample-transactions.csv in the root directory" -ForegroundColor Gray

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "Documentation:" -ForegroundColor Yellow
Write-Host "- README.md - Full documentation" -ForegroundColor Gray
Write-Host "- SETUP.md - Detailed setup guide" -ForegroundColor Gray
Write-Host "- API_DOCS.md - API endpoints reference" -ForegroundColor Gray
Write-Host "- DEPLOYMENT.md - Production deployment guide" -ForegroundColor Gray
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
