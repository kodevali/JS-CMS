#!/bin/bash
# Zero-config deploy for VM: no .env required. Run from project root.
set -e
cd "$(dirname "$0")"
if ! docker info >/dev/null 2>&1; then
  echo "Docker is not running. Start it (e.g. sudo systemctl start docker) and try again."
  exit 1
fi
if docker compose version >/dev/null 2>&1; then
  COMPOSE="docker compose"
else
  COMPOSE="docker-compose"
fi
echo "Starting JS-CMS (PostgreSQL + app)..."
$COMPOSE up -d --build
echo ""
echo "App: http://localhost:3000"
echo "Logs: $COMPOSE logs -f"
