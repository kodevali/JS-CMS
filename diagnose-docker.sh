#!/bin/bash
# Diagnostic script to gather Docker container information

echo "=== Docker Container Status ==="
docker-compose ps 2>&1 || echo "Could not check container status"

echo -e "\n=== App Container Logs (last 50 lines) ==="
docker-compose logs --tail 50 app 2>&1 || echo "Could not get app logs"

echo -e "\n=== Database Container Logs (last 20 lines) ==="
docker-compose logs --tail 20 postgres 2>&1 || echo "Could not get database logs"

echo -e "\n=== Debug Log File ==="
if [ -f .cursor/debug.log ]; then
  cat .cursor/debug.log
else
  echo "Debug log file not found at .cursor/debug.log"
fi

echo -e "\n=== Container File Check (if container is running) ==="
if docker ps | grep -q jscms-app; then
  echo "Checking for server.js in container:"
  docker-compose exec app ls -la /app/ 2>&1 | head -20 || echo "Could not list /app directory"
  echo ""
  echo "Searching for server.js:"
  docker-compose exec app find /app -name "server.js" -type f 2>&1 || echo "Could not search for server.js"
else
  echo "App container is not running"
fi
