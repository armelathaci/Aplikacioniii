# Deploy script for ruajmencur.me server
# This script should be run on the DigitalOcean Droplet

Write-Host "🚀 Starting deployment to ruajmencur.me server..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "[ERROR] package.json not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

Write-Host "[INFO] Updating code from repository..." -ForegroundColor Green
git pull origin main

Write-Host "[INFO] Installing/updating dependencies..." -ForegroundColor Green
npm install

Write-Host "[INFO] Checking if PM2 is running..." -ForegroundColor Green
if (-not (Get-Command pm2 -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] PM2 is not installed. Please install PM2 first." -ForegroundColor Red
    exit 1
}

Write-Host "[INFO] Restarting application with PM2..." -ForegroundColor Green
pm2 restart all

Write-Host "[INFO] Checking PM2 status..." -ForegroundColor Green
pm2 status

Write-Host "[INFO] Testing webhook endpoint..." -ForegroundColor Green
Write-Host "Testing webhook with curl..."

# Test the webhook endpoint
$timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
$testData = @{
    message = "Test deployment"
    userId = "deploy-test"
    timestamp = $timestamp
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://ruajmencur.me/webhook/finbot" -Method POST -Body $testData -ContentType "application/json"
    Write-Host "✅ Webhook test successful: $response" -ForegroundColor Green
} catch {
    Write-Host "❌ Webhook test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "[INFO] Checking nginx configuration..." -ForegroundColor Green
$nginxTest = & nginx -t 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "[INFO] Nginx configuration is valid. Reloading nginx..." -ForegroundColor Green
    sudo systemctl reload nginx
} else {
    Write-Host "[ERROR] Nginx configuration has errors: $nginxTest" -ForegroundColor Red
    exit 1
}

Write-Host "[INFO] Checking application logs..." -ForegroundColor Green
pm2 logs --lines 20

Write-Host "[INFO] Deployment completed!" -ForegroundColor Green
Write-Host "[INFO] You can check the application status with: pm2 status" -ForegroundColor Yellow
Write-Host "[INFO] You can view logs with: pm2 logs" -ForegroundColor Yellow
Write-Host "[INFO] You can test the webhook with: curl -X POST https://ruajmencur.me/webhook/finbot -H 'Content-Type: application/json' -d '{\"test\":\"1\"}'" -ForegroundColor Yellow
