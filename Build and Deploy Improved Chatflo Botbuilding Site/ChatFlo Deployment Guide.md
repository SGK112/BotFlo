# ChatFlo Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying ChatFlo to production environments. Whether you're deploying to a VPS, cloud platform, or container orchestration system, this guide covers all the necessary steps and best practices.

## Pre-Deployment Checklist

### 1. Environment Preparation

Before deploying, ensure you have:

- [ ] **Domain name** registered and DNS configured
- [ ] **SSL certificate** obtained (Let's Encrypt recommended)
- [ ] **MongoDB database** set up (MongoDB Atlas recommended)
- [ ] **Stripe account** configured with live API keys
- [ ] **Email service** configured (SendGrid, Mailgun, or SMTP)
- [ ] **Server or hosting platform** provisioned
- [ ] **Backup strategy** planned and implemented

### 2. Security Requirements

- [ ] **Firewall** configured to allow only necessary ports
- [ ] **SSH keys** set up for secure server access
- [ ] **Environment variables** securely stored
- [ ] **Database access** restricted to application servers
- [ ] **API keys** rotated and secured
- [ ] **HTTPS** enforced across all endpoints

### 3. Performance Considerations

- [ ] **CDN** configured for static assets
- [ ] **Database indexing** optimized
- [ ] **Caching strategy** implemented
- [ ] **Load balancing** configured (if multiple servers)
- [ ] **Monitoring** tools set up

## Production Environment Variables

Create a comprehensive `.env` file for production:

```env
# Application Environment
NODE_ENV=production
PORT=3000

# Database Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/chatflo-production?retryWrites=true&w=majority

# Authentication & Security
JWT_SECRET=your-super-secure-jwt-secret-minimum-32-characters-long
SESSION_SECRET=your-session-secret-for-express-sessions

# Payment Processing (Stripe Live Keys)
STRIPE_SECRET_KEY=sk_live_your_live_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_endpoint_secret
STRIPE_PROFESSIONAL_PRICE_ID=price_live_professional_plan_id
STRIPE_ENTERPRISE_PRICE_ID=price_live_enterprise_plan_id

# OpenAI Integration
OPENAI_API_KEY=sk-your-openai-api-key-for-ai-features

# Email Service Configuration
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=ChatFlo

# Application URLs
BASE_URL=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com

# File Upload & Storage
UPLOAD_PATH=/var/uploads/chatflo
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf,doc,docx

# Logging & Monitoring
LOG_LEVEL=info
LOG_FILE=/var/log/chatflo/app.log
SENTRY_DSN=your_sentry_dsn_for_error_tracking

# Rate Limiting
RATE_LIMIT_WINDOW=3600000
RATE_LIMIT_MAX_REQUESTS=1000

# Cache Configuration
REDIS_URL=redis://localhost:6379
CACHE_TTL=3600
```

## Deployment Methods

### Method 1: Traditional VPS Deployment

#### Step 1: Server Setup

**1.1 Initial Server Configuration**

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx

# Create application user
sudo adduser --system --group --home /opt/chatflo chatflo
sudo usermod -aG sudo chatflo
```

**1.2 Install Node.js**

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

**1.3 Install PM2 Process Manager**

```bash
# Install PM2 globally
sudo npm install -g pm2

# Configure PM2 startup
sudo pm2 startup systemd -u chatflo --hp /opt/chatflo
```

#### Step 2: Application Deployment

**2.1 Clone and Setup Application**

```bash
# Switch to application user
sudo su - chatflo

# Clone repository
cd /opt/chatflo
git clone https://github.com/SGK112/chatflo.git app
cd app

# Install dependencies
npm ci --production

# Create necessary directories
mkdir -p logs uploads
```

**2.2 Configure Environment**

```bash
# Create production environment file
cp .env.example .env

# Edit environment variables (use nano, vim, or your preferred editor)
nano .env

# Set proper permissions
chmod 600 .env
```

**2.3 PM2 Configuration**

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'chatflo',
    script: 'server.js',
    cwd: '/opt/chatflo/app',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/opt/chatflo/app/logs/err.log',
    out_file: '/opt/chatflo/app/logs/out.log',
    log_file: '/opt/chatflo/app/logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

**2.4 Start Application**

```bash
# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Check status
pm2 status
pm2 logs chatflo
```

#### Step 3: Nginx Configuration

**3.1 Create Nginx Configuration**

```bash
sudo nano /etc/nginx/sites-available/chatflo
```

```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

# Upstream configuration
upstream chatflo_backend {
    least_conn;
    server 127.0.0.1:3000 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS configuration
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # File upload size
    client_max_body_size 10M;

    # Static files
    location /static/ {
        alias /opt/chatflo/app/public/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API endpoints with rate limiting
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://chatflo_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Login endpoint with stricter rate limiting
    location /api/auth/login {
        limit_req zone=login burst=5 nodelay;
        
        proxy_pass http://chatflo_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Main application
    location / {
        proxy_pass http://chatflo_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check endpoint
    location /health {
        access_log off;
        proxy_pass http://chatflo_backend;
    }
}
```

**3.2 Enable Site and SSL**

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/chatflo /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Start Nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

#### Step 4: Database Setup

**4.1 MongoDB Atlas (Recommended)**

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create new cluster
3. Configure network access (whitelist your server IP)
4. Create database user
5. Get connection string and add to `.env`

**4.2 Self-hosted MongoDB**

```bash
# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl enable mongod
sudo systemctl start mongod

# Secure MongoDB
mongo
> use admin
> db.createUser({user: "admin", pwd: "secure_password", roles: ["userAdminAnyDatabase"]})
> exit

# Enable authentication
sudo nano /etc/mongod.conf
# Add: security.authorization: enabled

sudo systemctl restart mongod
```

### Method 2: Docker Deployment

#### Step 1: Create Docker Configuration

**Dockerfile**:
```dockerfile
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Bundle app source
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S chatflo -u 1001

# Change ownership
RUN chown -R chatflo:nodejs /usr/src/app
USER chatflo

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["npm", "start"]
```

**docker-compose.yml**:
```yaml
version: '3.8'

services:
  chatflo:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGO_URI=mongodb://mongo:27017/chatflo
    depends_on:
      - mongo
      - redis
    restart: unless-stopped
    volumes:
      - ./uploads:/usr/src/app/uploads
      - ./logs:/usr/src/app/logs

  mongo:
    image: mongo:5
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: secure_password
    volumes:
      - mongo_data:/data/db
    ports:
      - "27017:27017"

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - chatflo
    restart: unless-stopped

volumes:
  mongo_data:
  redis_data:
```

#### Step 2: Deploy with Docker

```bash
# Build and start services
docker-compose up -d

# Check logs
docker-compose logs -f chatflo

# Scale application
docker-compose up -d --scale chatflo=3
```

### Method 3: Cloud Platform Deployment

#### Heroku Deployment

**1. Prepare for Heroku**

```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login to Heroku
heroku login

# Create Heroku app
heroku create your-chatflo-app
```

**2. Configure Environment Variables**

```bash
# Set production environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGO_URI="your_mongodb_atlas_uri"
heroku config:set JWT_SECRET="your_jwt_secret"
heroku config:set STRIPE_SECRET_KEY="your_stripe_secret"
heroku config:set OPENAI_API_KEY="your_openai_key"
```

**3. Deploy Application**

```bash
# Deploy to Heroku
git push heroku main

# Scale dynos
heroku ps:scale web=2

# View logs
heroku logs --tail
```

#### AWS Deployment

**1. EC2 Instance Setup**

```bash
# Launch EC2 instance (Ubuntu 20.04 LTS)
# Configure security groups (ports 22, 80, 443)
# Attach Elastic IP

# Connect to instance
ssh -i your-key.pem ubuntu@your-elastic-ip
```

**2. Application Load Balancer**

```bash
# Create Application Load Balancer
# Configure target groups
# Set up health checks
# Configure SSL certificate
```

**3. RDS Database**

```bash
# Create RDS instance (if not using MongoDB Atlas)
# Configure security groups
# Set up automated backups
```

#### DigitalOcean Deployment

**1. Create Droplet**

```bash
# Create Ubuntu 20.04 droplet
# Add SSH keys
# Configure firewall
```

**2. Use DigitalOcean App Platform**

```yaml
# app.yaml
name: chatflo
services:
- name: web
  source_dir: /
  github:
    repo: your-username/chatflo
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 2
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: MONGO_URI
    value: your_mongodb_uri
    type: SECRET
```

## Post-Deployment Configuration

### 1. SSL Certificate Setup

**Let's Encrypt with Certbot**:
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 2. Monitoring Setup

**Application Monitoring**:
```bash
# Install monitoring tools
npm install --save newrelic
npm install --save @sentry/node

# Configure in server.js
require('newrelic');
const Sentry = require('@sentry/node');
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

**System Monitoring**:
```bash
# Install system monitoring
sudo apt install htop iotop nethogs

# Set up log rotation
sudo nano /etc/logrotate.d/chatflo
```

### 3. Backup Configuration

**Database Backup Script**:
```bash
#!/bin/bash
# backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups/chatflo"
MONGO_URI="your_mongodb_uri"

mkdir -p $BACKUP_DIR

mongodump --uri="$MONGO_URI" --out="$BACKUP_DIR/backup_$DATE"

# Compress backup
tar -czf "$BACKUP_DIR/backup_$DATE.tar.gz" -C "$BACKUP_DIR" "backup_$DATE"
rm -rf "$BACKUP_DIR/backup_$DATE"

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +7 -delete
```

**Automated Backups**:
```bash
# Make script executable
chmod +x backup-db.sh

# Add to crontab
crontab -e
# Add: 0 2 * * * /opt/chatflo/backup-db.sh
```

### 4. Performance Optimization

**Redis Caching**:
```javascript
// Add to server.js
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

// Cache middleware
const cache = (duration) => {
  return async (req, res, next) => {
    const key = req.originalUrl;
    const cached = await client.get(key);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    res.sendResponse = res.json;
    res.json = (body) => {
      client.setex(key, duration, JSON.stringify(body));
      res.sendResponse(body);
    };
    
    next();
  };
};
```

**CDN Configuration**:
```bash
# Configure CloudFlare or AWS CloudFront
# Set up static asset caching
# Configure image optimization
```

## Security Hardening

### 1. Server Security

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Disable root login
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
# Set: PasswordAuthentication no

sudo systemctl restart ssh
```

### 2. Application Security

**Security Headers**:
```javascript
// Add to server.js
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

**Rate Limiting**:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

### 3. Database Security

```bash
# MongoDB security
# Enable authentication
# Use SSL/TLS connections
# Regular security updates
# Network access restrictions
```

## Troubleshooting

### Common Issues

**1. Application Won't Start**
```bash
# Check logs
pm2 logs chatflo
tail -f /opt/chatflo/app/logs/combined.log

# Check environment variables
pm2 env 0

# Restart application
pm2 restart chatflo
```

**2. Database Connection Issues**
```bash
# Test MongoDB connection
mongo "your_mongodb_uri"

# Check network connectivity
telnet your-mongo-host 27017

# Verify credentials
```

**3. SSL Certificate Issues**
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Test SSL configuration
openssl s_client -connect yourdomain.com:443
```

**4. Performance Issues**
```bash
# Monitor system resources
htop
iotop
free -h

# Check application metrics
pm2 monit

# Analyze slow queries
# MongoDB profiler
```

### Monitoring Commands

```bash
# System monitoring
sudo systemctl status nginx
sudo systemctl status mongod
pm2 status

# Log monitoring
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
pm2 logs chatflo

# Performance monitoring
iostat -x 1
vmstat 1
netstat -tulpn
```

## Maintenance

### Regular Maintenance Tasks

**Daily**:
- [ ] Check application logs for errors
- [ ] Monitor system resources
- [ ] Verify backup completion

**Weekly**:
- [ ] Update system packages
- [ ] Review security logs
- [ ] Check SSL certificate expiry
- [ ] Performance analysis

**Monthly**:
- [ ] Update Node.js dependencies
- [ ] Security audit
- [ ] Database optimization
- [ ] Backup restoration test

### Update Procedure

```bash
# 1. Backup current version
pm2 stop chatflo
cp -r /opt/chatflo/app /opt/chatflo/app-backup-$(date +%Y%m%d)

# 2. Update application
cd /opt/chatflo/app
git pull origin main
npm ci --production

# 3. Run database migrations (if any)
npm run migrate

# 4. Restart application
pm2 start chatflo

# 5. Verify deployment
curl -f https://yourdomain.com/health
```

## Support and Resources

### Documentation
- [ChatFlo API Documentation](./API_DOCUMENTATION.md)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)

### Community
- GitHub Issues: [https://github.com/SGK112/chatflo/issues](https://github.com/SGK112/chatflo/issues)
- Discord Community: [Join our Discord](https://discord.gg/chatflo)
- Stack Overflow: Tag questions with `chatflo`

### Professional Support
- Email: support@chatflo.com
- Enterprise Support: enterprise@chatflo.com
- Emergency Support: +1-555-CHATFLO

---

*This deployment guide is maintained by the ChatFlo team. Last updated: June 25, 2025*

