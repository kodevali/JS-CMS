#!/bin/bash
set -e

echo "🐳 JS-CMS Docker Deployment"
echo "============================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "Creating .env from .env.example (if exists)..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Created .env file. Please edit it with your settings."
        echo ""
        echo "Required variables:"
        echo "  - DB_PASSWORD (database password)"
        echo "  - JWT_SECRET (generate with: openssl rand -base64 32)"
        echo "  - GOOGLE_CLIENT_ID"
        echo "  - GOOGLE_CLIENT_SECRET"
        echo ""
        read -p "Press Enter after editing .env to continue..."
    else
        echo "❌ .env.example not found. Please create .env manually."
        exit 1
    fi
fi

# Check if schema is PostgreSQL
if grep -q 'provider = "sqlite"' prisma/schema.prisma 2>/dev/null; then
    echo "⚠️  Prisma schema is set to SQLite"
    echo "Switching to PostgreSQL for Docker..."
    node scripts/prepare-for-production.js --postgres
    echo ""
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    echo "   Run: sudo systemctl start docker"
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose > /dev/null 2>&1 && ! docker compose version > /dev/null 2>&1; then
    echo "❌ Docker Compose is not installed!"
    echo ""
    echo "Please install Docker Compose:"
    echo "  sudo apt install docker-compose"
    echo ""
    echo "Or install the plugin version:"
    echo "  sudo apt install docker-compose-plugin"
    echo ""
    echo "See DOCKER_SETUP.md for detailed instructions."
    exit 1
fi

# Determine which compose command to use
if command -v docker-compose > /dev/null 2>&1; then
    COMPOSE_CMD="docker-compose"
elif docker compose version > /dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
else
    echo "❌ Could not find Docker Compose command"
    exit 1
fi

echo "🚀 Starting Docker containers..."
echo ""

# Build and start
$COMPOSE_CMD up -d --build

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check if containers are running
if $COMPOSE_CMD ps | grep -q "Up"; then
    echo ""
    echo "✅ Services are running!"
    echo ""
    echo "📊 Container Status:"
    $COMPOSE_CMD ps
    echo ""
    echo "🌐 Application: http://localhost:3000"
    echo ""
    echo "📝 View logs: $COMPOSE_CMD logs -f"
    echo "🛑 Stop: $COMPOSE_CMD down"
    echo ""
else
    echo "❌ Some containers failed to start. Check logs:"
    echo "   $COMPOSE_CMD logs"
    exit 1
fi
