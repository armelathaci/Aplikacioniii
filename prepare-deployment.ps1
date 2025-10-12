# Prepare deployment package for ruajmencur.me
# This script prepares the files for manual deployment

Write-Host "🚀 Preparing deployment package..." -ForegroundColor Green

# Create deployment directory
$deployDir = "deployment-package"
if (Test-Path $deployDir) {
    Remove-Item -Recurse -Force $deployDir
}
New-Item -ItemType Directory -Path $deployDir

Write-Host "[INFO] Copying backend files..." -ForegroundColor Green
# Copy backend files excluding node_modules
$backendFiles = Get-ChildItem -Path "backend" -Exclude "node_modules"
foreach ($file in $backendFiles) {
    if ($file.PSIsContainer) {
        Copy-Item -Recurse -Path $file.FullName -Destination "$deployDir\backend\$($file.Name)"
    } else {
        Copy-Item -Path $file.FullName -Destination "$deployDir\backend\$($file.Name)"
    }
}

Write-Host "[INFO] Building frontend..." -ForegroundColor Green
Set-Location frontend
npm install
npm run build
Set-Location ..

Write-Host "[INFO] Copying frontend build..." -ForegroundColor Green
Copy-Item -Recurse -Path "frontend\build" -Destination "$deployDir\frontend"

Write-Host "[INFO] Copying deployment scripts..." -ForegroundColor Green
Copy-Item -Path "deploy-to-server.sh" -Destination "$deployDir\"
Copy-Item -Path "deploy-to-server.ps1" -Destination "$deployDir\"
Copy-Item -Path "DEPLOYMENT-GUIDE.md" -Destination "$deployDir\"

Write-Host "[INFO] Creating deployment instructions..." -ForegroundColor Green
$instructions = @"
# Deployment Instructions for ruajmencur.me

## Manual Deployment Steps:

1. Upload the contents of this folder to your server
2. SSH into your server: ssh root@ruajmencur.me
3. Navigate to your project directory
4. Run the deployment script: ./deploy-to-server.sh
5. Or run the PowerShell script: .\deploy-to-server.ps1

## Alternative: Direct File Upload
If you can't SSH, you can upload these files directly:
- Upload backend/ folder to your server
- Upload frontend/ folder to your server
- Restart your application (PM2, Docker, etc.)

## Testing
After deployment, test the webhook:
curl -X POST https://ruajmencur.me/webhook/finbot -H "Content-Type: application/json" -d '{"test":"1"}'

## Files included:
- backend/ (Node.js backend)
- frontend/ (React build)
- deploy-to-server.sh (Linux deployment script)
- deploy-to-server.ps1 (Windows deployment script)
- DEPLOYMENT-GUIDE.md (Detailed guide)
"@

$instructions | Out-File -FilePath "$deployDir\DEPLOYMENT-INSTRUCTIONS.md" -Encoding UTF8

Write-Host "[INFO] Deployment package created in: $deployDir" -ForegroundColor Green
Write-Host "[INFO] You can now upload the contents of $deployDir to your server" -ForegroundColor Yellow
Write-Host "[INFO] Or use the deployment scripts included in the package" -ForegroundColor Yellow

# Show package contents
Write-Host "`nPackage contents:" -ForegroundColor Cyan
Get-ChildItem -Recurse $deployDir | Select-Object Name, Length, LastWriteTime
