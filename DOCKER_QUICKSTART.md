# Docker Quick Start 🐳

Get your JS-CMS running in Docker in 3 steps!

## Prerequisites

- Docker and Docker Compose installed
- Ports 3000 and 5432 available

## Quick Start

### 1. Set Up Environment

```bash
# Create .env file
cat > .env << EOF
DB_PASSWORD=changeme123
JWT_SECRET=$(openssl rand -base64 32)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google
EOF
```

**Important:** Replace the placeholder values with your actual credentials!

### 2. Switch to PostgreSQL Schema

```bash
node scripts/prepare-for-production.js --postgres
```

### 3. Start Everything

```bash
# Option A: Use the helper script
./docker-start.sh

# Option B: Manual start
docker compose up -d --build
```

That's it! Your app is running at **http://localhost:3000**

## Common Commands

```bash
# View logs
docker compose logs -f

# Stop everything
docker compose down

# Restart
docker compose restart

# Update and rebuild
git pull
docker compose up -d --build
```

## What's Included?

- ✅ PostgreSQL database (with persistent storage)
- ✅ Next.js application
- ✅ Automatic database migrations
- ✅ Health checks
- ✅ Production-ready configuration

## Next Steps

- See `DOCKER_DEPLOYMENT.md` for detailed documentation
- Set up reverse proxy (Nginx) for production
- Configure HTTPS with Let's Encrypt
- Set up automated backups

## Troubleshooting

**Can't connect to database?**
```bash
docker compose logs postgres
```

**Migrations failing?**
```bash
docker compose exec app npx prisma migrate status
```

**Port already in use?**
Edit `docker-compose.yml` and change the port mapping.

For more help, see the full `DOCKER_DEPLOYMENT.md` guide.
