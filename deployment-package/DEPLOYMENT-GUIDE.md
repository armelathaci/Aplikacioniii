# Deployment Guide për ruajmencur.me

## Problemet e identifikuara dhe zgjidhjet:

### 1. ❌ 404 Not Found për user.icon.png
**Zgjidhja:** ✅ E ndrequr
- File-i u kopjua nga `frontend/src/img/user.icon.png` në `frontend/public/img/user.icon.png`
- Tani frontend mund të aksesojë ikonën nëpërmjet path-it absolut `/img/user.icon.png`

### 2. ❌ 405 Method Not Allowed për /webhook/finbot
**Zgjidhja:** ✅ E ndrequr në kod
- U krijua `backend/routes/webhookRoutes.js` me route për POST /webhook/finbot
- U shtua webhook routes në `backend/server.js`
- Route-i pranon POST requests dhe kthen 200 OK

## Hapat për deployment në server:

### 1. Lidhu me serverin DigitalOcean:
```bash
ssh root@ruajmencur.me
# ose
ssh your-username@ruajmencur.me
```

### 2. Navigo në direktorinë e projektit:
```bash
cd /path/to/your/project
# ose
cd ~/Aplikacioniii
```

### 3. Përditëso kodin:
```bash
git pull origin main
```

### 4. Instalo dependencies:
```bash
npm install
```

### 5. Rifillo aplikacionin:
```bash
# Nëse përdor PM2:
pm2 restart all

# Nëse përdor Docker:
docker-compose restart

# Nëse përdor systemd:
sudo systemctl restart your-app-service
```

### 6. Kontrollo nginx config:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 7. Testo webhook-in:
```bash
curl -i -X POST https://ruajmencur.me/webhook/finbot \
  -H "Content-Type: application/json" \
  -d '{"message":"Test","userId":"test","timestamp":"2025-09-19T21:42:00.000Z"}'
```

**Përgjigja e pritshme:**
```json
{
  "success": true,
  "data": {
    "status": "success",
    "message": "Webhook received successfully",
    "receivedAt": "2025-09-19T21:42:00.000Z",
    "data": {
      "message": "Test",
      "userId": "test",
      "timestamp": "2025-09-19T21:42:00.000Z"
    }
  }
}
```

## Nginx Configuration (nëse është e nevojshme):

Sigurohu që nginx config përmban:

```nginx
server {
    listen 80;
    listen 443 ssl;
    server_name ruajmencur.me;

    # CORS headers
    add_header 'Access-Control-Allow-Origin' 'https://ruajmencur.me' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, x-session-id' always;

    # Handle OPTIONS requests
    location / {
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' 'https://ruajmencur.me';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, x-session-id';
            add_header 'Access-Control-Max-Age' 86400;
            add_header 'Content-Length' 0;
            add_header 'Content-Type' 'text/plain';
            return 204;
        }

        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Monitoring dhe Debugging:

### 1. Kontrollo logs:
```bash
# PM2 logs:
pm2 logs

# Nginx logs:
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Application logs:
pm2 logs your-app-name
```

### 2. Kontrollo statusin e aplikacionit:
```bash
pm2 status
pm2 monit
```

### 3. Testo endpoints:
```bash
# Test webhook:
curl -X POST https://ruajmencur.me/webhook/finbot \
  -H "Content-Type: application/json" \
  -d '{"test":"1"}'

# Test frontend:
curl -I https://ruajmencur.me/img/user.icon.png
```

## Verifikimi i suksesit:

Pas deployment-it, duhet të shohësh:

1. ✅ **404 për user.icon.png është ndrequr** - ikona duhet të shfaqet në frontend
2. ✅ **405 për /webhook/finbot është ndrequr** - webhook duhet të kthejë 200 OK
3. ✅ **Nuk ka më gabime në Console** - browser console duhet të jetë i pastër

## Troubleshooting:

### Nëse webhook ende kthen 405:
1. Kontrollo nëse aplikacioni është rifilluar
2. Kontrollo nëse route-i është shtuar në server.js
3. Kontrollo nginx config për CORS
4. Kontrollo logs për gabime

### Nëse ikona ende nuk shfaqet:
1. Kontrollo nëse file-i është kopjuar në public/img/
2. Kontrollo nëse nginx shërben static files
3. Kontrollo browser cache (Ctrl+F5)

### Nëse ka probleme me CORS:
1. Kontrollo nginx config
2. Kontrollo CORS headers në server.js
3. Kontrollo nëse frontend dërgon headers të duhur
