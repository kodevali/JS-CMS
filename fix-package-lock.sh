#!/bin/bash
# Script to fix package-lock.json sync issues

echo "🔧 Fixing package-lock.json sync issue..."
echo ""

# Remove old lock file
if [ -f package-lock.json ]; then
    echo "Removing outdated package-lock.json..."
    rm package-lock.json
fi

# Regenerate lock file
echo "Regenerating package-lock.json from package.json..."
npm install --package-lock-only

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ package-lock.json regenerated successfully!"
    echo ""
    echo "You can now run:"
    echo "  ./docker-start.sh"
    echo ""
    echo "Or manually:"
    echo "  docker-compose up -d --build"
else
    echo ""
    echo "❌ Failed to regenerate package-lock.json"
    echo "Try running: npm install"
    exit 1
fi
