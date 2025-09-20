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
