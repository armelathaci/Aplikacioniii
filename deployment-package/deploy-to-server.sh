#!/bin/bash

# Deploy script for ruajmencur.me server
# This script should be run on the DigitalOcean Droplet

echo "🚀 Starting deployment to ruajmencur.me server..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

print_status "Updating code from repository..."
git pull origin main

print_status "Installing/updating dependencies..."
npm install

print_status "Checking if PM2 is running..."
if ! command -v pm2 &> /dev/null; then
    print_error "PM2 is not installed. Please install PM2 first."
    exit 1
fi

print_status "Restarting application with PM2..."
pm2 restart all

print_status "Checking PM2 status..."
pm2 status

print_status "Testing webhook endpoint..."
echo "Testing webhook with curl..."

# Test the webhook endpoint
curl -i -X POST https://ruajmencur.me/webhook/finbot \
  -H "Content-Type: application/json" \
  -d '{"message":"Test deployment","userId":"deploy-test","timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'"}'

echo ""
print_status "Checking nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    print_status "Nginx configuration is valid. Reloading nginx..."
    sudo systemctl reload nginx
else
    print_error "Nginx configuration has errors. Please fix them first."
    exit 1
fi

print_status "Checking application logs..."
pm2 logs --lines 20

print_status "Deployment completed!"
print_status "You can check the application status with: pm2 status"
print_status "You can view logs with: pm2 logs"
print_status "You can test the webhook with: curl -X POST https://ruajmencur.me/webhook/finbot -H 'Content-Type: application/json' -d '{\"test\":\"1\"}'"
