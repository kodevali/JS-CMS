# Docker Self-Hosting Guide

This guide will help you deploy JS-CMS using Docker and Docker Compose. This is perfect for self-hosting on your own server, VPS, or cloud instance.

## 🎯 Overview

The Docker setup includes:
- **PostgreSQL Database** - Containerized database with persistent storage
- **Next.js Application** - Your CMS application
- **Automatic Migrations** - Database migrations run on startup
- **Health Checks** - Ensures database is ready before starting the app

## 📋 Prerequisites

- Docker Engine 20.10+ installed
- Docker Compose 2.0+ installed
- At least 2GB RAM available
- Port 3000 and 5432 available (or change in docker-compose.yml)

### Install Docker (if needed)

**Ubuntu/Debian:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
# Log out and back in for group changes to take effect
```

**macOS:**
```bash
# Install Docker Desktop from https://www.docker.com/products/docker-desktop
```

**Verify installation:**
```bash
docker --version
docker compose version
```

## 🚀 Quick Start

### 1. Prepare Environment Variables

Create a `.env` file in the project root:

```bash
cd /home/kodevali/JSCMS/JS-CMS
cp .env.example .env
```

Edit `.env` and set:

```env
# Database password (change this!)
DB_PASSWORD=your-secure-password-here

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your-jwt-secret-here

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# OAuth Redirect URI (update with your domain)
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google
# For production: https://your-domain.com/api/auth/callback/google
```

### 2. Switch Prisma Schema to PostgreSQL

The Docker setup uses PostgreSQL. Make sure your schema is configured:

```bash
node scripts/prepare-for-production.js --postgres
```

Or manually edit `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 3. Build and Start

```bash
# Build and start all services
docker compose up -d

# View logs
docker compose logs -f

# Check status
docker compose ps
```

The application will be available at: **http://localhost:3000**

## 📝 Detailed Steps

### Step 1: Configure Environment

Create `.env` file with your settings (see Quick Start above).

**Important:** 
- Change `DB_PASSWORD` to a strong password
- Generate a secure `JWT_SECRET` using: `openssl rand -base64 32`
- Get Google OAuth credentials from [Google Cloud Console](https://console.cloud.google.com/)

### Step 2: Update Google OAuth Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add authorized redirect URI:
   - For local: `http://localhost:3000/api/auth/callback/google`
   - For production: `https://your-domain.com/api/auth/callback/google`

### Step 3: Build Docker Images

```bash
# Build the application image
docker compose build

# Or build and start in one command
docker compose up -d --build
```

### Step 4: Verify Deployment

```bash
# Check container status
docker compose ps

# View application logs
docker compose logs app

# View database logs
docker compose logs postgres

# Check if migrations ran successfully
docker compose logs app | grep -i migration
```

### Step 5: Access the Application

- **Application:** http://localhost:3000
- **Database:** localhost:5432 (if you need direct access)

## 🔧 Common Operations

### View Logs

```bash
# All services
docker compose logs -f

# Just the app
docker compose logs -f app

# Just the database
docker compose logs -f postgres
```

### Stop Services

```bash
docker compose down
```

### Stop and Remove Volumes (⚠️ Deletes Data)

```bash
docker compose down -v
```

### Restart Services

```bash
docker compose restart
```

### Update Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker compose up -d --build
```

### Run Database Migrations Manually

```bash
# Enter the app container
docker compose exec app sh

# Run migrations
npx prisma migrate deploy

# Or use Prisma Studio
npx prisma studio
# Access at http://localhost:5555
```

### Access Database Directly

```bash
# Connect to PostgreSQL
docker compose exec postgres psql -U jscms -d jscms

# Or from host machine (if you have psql installed)
psql -h localhost -U jscms -d jscms
# Password: (from DB_PASSWORD in .env)
```

## 🌐 Production Deployment

### 1. Use a Reverse Proxy (Recommended)

Use Nginx or Traefik as a reverse proxy:

**Nginx Example:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. Use HTTPS

Set up SSL certificates (Let's Encrypt recommended):

```bash
# Using certbot
sudo certbot --nginx -d your-domain.com
```

### 3. Update Environment Variables

Update `.env` for production:

```env
GOOGLE_REDIRECT_URI=https://your-domain.com/api/auth/callback/google
NODE_ENV=production
```

Then restart:
```bash
docker compose down
docker compose up -d
```

### 4. Configure Firewall

```bash
# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Block direct database access from internet (optional)
sudo ufw deny 5432/tcp
```

### 5. Set Up Backups

**Database Backup Script:**
```bash
#!/bin/bash
# backup-db.sh
docker compose exec -T postgres pg_dump -U jscms jscms > backup-$(date +%Y%m%d-%H%M%S).sql
```

**Restore:**
```bash
cat backup-*.sql | docker compose exec -T postgres psql -U jscms -d jscms
```

## 🔒 Security Best Practices

1. **Change Default Passwords**
   - Set strong `DB_PASSWORD` in `.env`
   - Generate secure `JWT_SECRET`

2. **Use Environment Variables**
   - Never commit `.env` to git
   - Use secrets management in production

3. **Keep Images Updated**
   ```bash
   docker compose pull
   docker compose up -d
   ```

4. **Limit Database Access**
   - Don't expose PostgreSQL port (5432) to the internet
   - Use firewall rules

5. **Regular Backups**
   - Set up automated database backups
   - Test restore procedures

## 🐛 Troubleshooting

### Application Won't Start

```bash
# Check logs
docker compose logs app

# Common issues:
# - Database not ready: Wait a few seconds and restart
# - Migration errors: Check database connection
# - Port already in use: Change port in docker-compose.yml
```

### Database Connection Errors

```bash
# Verify database is running
docker compose ps postgres

# Check database logs
docker compose logs postgres

# Test connection
docker compose exec app npx prisma db execute --stdin <<< "SELECT 1"
```

### Migration Errors

```bash
# Check migration status
docker compose exec app npx prisma migrate status

# Reset database (⚠️ Deletes all data)
docker compose down -v
docker compose up -d
```

### Port Already in Use

Edit `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Change 3000 to 3001
```

### Out of Memory

```bash
# Check resource usage
docker stats

# Increase Docker memory limit in Docker Desktop settings
```

## 📊 Monitoring

### View Resource Usage

```bash
docker stats
```

### Health Checks

The containers include health checks. View status:
```bash
docker compose ps
```

## 🔄 Updates and Maintenance

### Update Application Code

```bash
git pull
docker compose build
docker compose up -d
```

### Update Dependencies

```bash
# Rebuild with no cache
docker compose build --no-cache
docker compose up -d
```

### Database Migrations

Migrations run automatically on startup. To run manually:

```bash
docker compose exec app npx prisma migrate deploy
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
- [Prisma with Docker](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-docker)

## ✅ Deployment Checklist

- [ ] Docker and Docker Compose installed
- [ ] `.env` file configured with secure values
- [ ] Prisma schema switched to PostgreSQL
- [ ] Google OAuth credentials configured
- [ ] Google OAuth redirect URI updated
- [ ] Containers built and started
- [ ] Application accessible at configured URL
- [ ] Database migrations completed
- [ ] OAuth sign-in working
- [ ] Reverse proxy configured (production)
- [ ] HTTPS enabled (production)
- [ ] Backups configured (production)
- [ ] Firewall rules set (production)

---

## 🎉 You're Done!

Your JS-CMS is now running in Docker! Access it at http://localhost:3000 (or your configured domain).

For production deployments, make sure to:
- Use a reverse proxy (Nginx/Traefik)
- Enable HTTPS
- Set up regular backups
- Monitor resource usage
- Keep images updated
