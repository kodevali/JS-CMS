# Quick Fix for localhost Connection Issue

## Issue
localhost:3000 is refusing connections after Docker containers start.

## Most Likely Causes

1. **OpenSSL missing** - Prisma needs OpenSSL 1.1 (FIXED in Dockerfile, needs rebuild)
2. **server.js not found** - Entrypoint script now handles this automatically
3. **Container crashed** - Check logs to see why

## Solution Steps

### 1. Rebuild with OpenSSL fix (required)

```bash
cd /home/kodevali/JSCMS/JS-CMS
docker-compose down
docker-compose build --no-cache app
docker-compose up -d
```

### 2. Check container status

```bash
docker-compose ps
```

Expected output: Both `jscms-app` and `jscms-db` should show status "Up"

### 3. Check application logs

```bash
docker-compose logs --tail 50 app
```

Look for:
- ✅ "Database is ready!"
- ✅ "Migrations check completed!"
- ✅ "Starting Next.js server..."
- ✅ "Executing: node server.js"
- ❌ Any error messages

### 4. Check debug logs

The entrypoint script logs to stderr (visible in docker logs) and to `.cursor/debug.log`:

```bash
# Check file (if volume mount works)
cat .cursor/debug.log

# Or check stderr logs (always works)
docker-compose logs app 2>&1 | grep "\[DEBUG\]"
```

### 5. Verify server.js exists

```bash
docker-compose exec app ls -la /app/server.js
```

Should show: `-rw-r--r-- 1 nextjs nodejs ... server.js`

### 6. Test the connection

```bash
curl http://localhost:3000
```

Or open in browser: http://localhost:3000

## Common Issues and Fixes

### Issue: Container exits immediately
**Check logs:** `docker-compose logs app`
**Common causes:**
- Database connection failed → Check postgres container is running
- Migration failed → Check database logs
- server.js not found → Entrypoint should handle this, check logs

### Issue: Port 3000 already in use
```bash
# Check what's using port 3000
sudo lsof -i :3000

# Or change port in docker-compose.yml
ports:
  - "3001:3000"  # Use 3001 instead
```

### Issue: OpenSSL/Prisma errors
The Dockerfile now includes `openssl1.1-compat`. Rebuild:
```bash
docker-compose build --no-cache app
```

### Issue: Permission denied
```bash
# Add user to docker group (requires logout/login)
sudo usermod -aG docker $USER
```

## Full Reset (if nothing works)

```bash
# Stop and remove everything (⚠️ deletes database data)
docker-compose down -v

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up -d

# Watch logs
docker-compose logs -f
```

## Next Steps After Fix

Once it's working:
1. Access http://localhost:3000
2. Test Google OAuth sign-in
3. Verify database operations work
4. Check health endpoint (if implemented)
