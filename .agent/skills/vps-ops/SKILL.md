---
name: vps-ops
description: Specialized skill for managing Beget VPS, Nginx, and SSL configurations. Use this skill when the user asks to "deploy", "fix server", "setup https", or "check logs".
---

# VPS Ops (Beget)

This skill provides workflows and knowledge for administering the Beget VPS server running the Green Hill project.

## Overview

The Green Hill project runs on a Beget VPS using:

- **OS**: Ubuntu (Beget Default)
- **Web Server**: Nginx (Reverse Proxy)
- **App Server**: Node.js (PM2)
- **Path**: `/var/www/greenhill`

## Common Workflows

### 1. SSH Connection

```bash
ssh user@85.198.68.12
# Password: (Ask user if not in env)
```

### 2. Nginx Management

Config location: `/etc/nginx/sites-available/greenhill`

**Restart Nginx:**

```bash
sudo nginx -t && sudo systemctl reload nginx
```

**Standard Config Template** (Node.js + SSL):
See `references/nginx.md` (to be created) or use the template below:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    # ... SSL params ...
    location / {
        proxy_pass http://127.0.0.1:4321;
    }
}
```

### 3. SSL Setup (Certbot)

**Install Certbot:**

```bash
sudo apt install certbot python3-certbot-nginx
```

**Obtain Certificate:**

```bash
sudo certbot --nginx -d yourdomain.com
```

*Note: Ensure DNS A-record points to the server IP before running this.*

### 4. PM2 Management

**Check Status:**

```bash
pm2 status
```

**Logs:**

```bash
pm2 logs greenhill --lines 100
```

**Restart:**

```bash
pm2 reload greenhill
```

## Troubleshooting guide

- **502 Bad Gateway**: Usually means Node.js app is down. Check `pm2 status` and `pm2 logs`.
- **413 Request Entity Too Large**: Increase `client_max_body_size` in Nginx config.
- **Bot images not loading**: Check if URL is HTTPS. Telegram requires HTTPS for all media links.
