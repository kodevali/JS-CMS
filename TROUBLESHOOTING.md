# Docker Troubleshooting Guide

## localhost Refused to Connect

If you're getting "localhost refused to connect" when trying to access http://localhost:3000, follow these steps:

### 1. Check if Containers are Running

```bash
docker-compose ps
```

You should see both `jscms-app` and `jscms-db` containers with status "Up".

### 2. Check Container Status

```bash
# Check all containers (including stopped ones)
docker ps -a | grep jscms

# Check if containers are running
docker-compose ps
```

**If containers are not running:**
- Start them: `docker-compose up -d`
- Check logs: `docker-compose logs`

### 3. Check Application Logs

```bash
# View recent app logs
docker-compose logs app --tail 50

# Follow logs in real-time
docker-compose logs -f app
```

**Common issues to look for:**
- Database connection errors
- Migration failures
- Port binding errors
- Application crashes

### 4. Check Database Connection

```bash
# Check database logs
docker-compose logs postgres --tail 50

# Test database connection
docker-compose exec app npx prisma db execute --stdin <<< "SELECT 1"
```

### 5. Verify Port Mapping

```bash
# Check if port 3000 is in use
netstat -tuln | grep 3000
# or
ss -tuln | grep 3000

# Check what's listening on port 3000
lsof -i :3000
```

**If port 3000 is already in use:**
- Stop the other service using port 3000
- Or change the port in `docker-compose.yml`:
  ```yaml
  ports:
    - "3001:3000"  # Change 3000 to 3001
  ```

### 6. Check Container Health

```bash
# Check container health status
docker-compose ps

# Inspect container
docker inspect jscms-app | grep -A 10 Health
```

### 7. Restart Containers

```bash
# Stop and remove containers
docker-compose down

# Rebuild and start
docker-compose up -d --build

# Or use the helper script
./docker-start.sh
```

### 8. Common Issues and Solutions

#### Issue: Container exits immediately
```bash
# Check exit code
docker-compose ps

# View logs to see why it exited
docker-compose logs app
```

#### Issue: Database not ready
```bash
# Wait for database to be healthy
docker-compose ps postgres

# Check database health
docker-compose exec postgres pg_isready -U jscms
```

#### Issue: Migration errors
```bash
# Check migration status
docker-compose exec app npx prisma migrate status

# Run migrations manually
docker-compose exec app npx prisma migrate deploy
```

#### Issue: Permission errors
```bash
# Check if user is in docker group
groups | grep docker

# If not, add user to docker group (requires logout/login)
sudo usermod -aG docker $USER
```

### 9. Complete Reset (⚠️ Deletes Data)

If nothing works, you can reset everything:

```bash
# Stop and remove containers and volumes
docker-compose down -v

# Rebuild from scratch
docker-compose up -d --build
```

### 10. Verify Environment Variables

```bash
# Check environment variables in container
docker-compose exec app env | grep -E "DATABASE_URL|JWT_SECRET|GOOGLE"

# Verify .env file exists and has correct values
cat .env
```

### 11. Check Network Connectivity

```bash
# Test if app container can reach database
docker-compose exec app ping postgres

# Test database connection from app
docker-compose exec app npx prisma db execute --stdin <<< "SELECT 1"
```

## Quick Diagnostic Commands

Run these to get a full picture:

```bash
# Full status check
echo "=== Container Status ==="
docker-compose ps

echo -e "\n=== App Logs (last 20 lines) ==="
docker-compose logs app --tail 20

echo -e "\n=== Database Logs (last 20 lines) ==="
docker-compose logs postgres --tail 20

echo -e "\n=== Port Check ==="
netstat -tuln | grep 3000 || echo "Port 3000 not in use"

echo -e "\n=== Environment Check ==="
docker-compose exec app env | grep -E "DATABASE_URL|NODE_ENV" || echo "Cannot check env"
```

## Still Having Issues?

1. **Check Docker is running:**
   ```bash
   docker info
   ```

2. **Check Docker Compose version:**
   ```bash
   docker-compose --version
   ```

3. **View all logs:**
   ```bash
   docker-compose logs
   ```

4. **Check system resources:**
   ```bash
   docker stats
   ```
