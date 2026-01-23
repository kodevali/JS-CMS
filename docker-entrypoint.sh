#!/bin/sh
set -e

# #region agent log
LOG_FILE="/app/.cursor/debug.log"
# Try to create directory, but don't fail if we can't (e.g., volume mount permissions)
mkdir -p /app/.cursor 2>/dev/null || true
# Fall back to a writable location if needed
if ! touch "$LOG_FILE" 2>/dev/null; then
  LOG_FILE="/tmp/jscms-debug.log"
fi
log_debug() {
  LOG_ENTRY="{\"timestamp\":$(date +%s000),\"location\":\"docker-entrypoint.sh:$1\",\"message\":\"$2\",\"data\":$3,\"sessionId\":\"debug-session\",\"runId\":\"run1\",\"hypothesisId\":\"$4\"}"
  # Try to write to log file, but don't fail if we can't (permission issues with volume mounts)
  (echo "$LOG_ENTRY" >> "$LOG_FILE" 2>/dev/null) || true
  # Always output to stderr for docker logs
  echo "[DEBUG] $LOG_ENTRY" >&2
}
# #endregion

echo "🚀 Starting JS-CMS application..."
log_debug "4" "Entrypoint script started" "{\"pid\":$$}" "A"

# Wait for database to be ready (with timeout)
echo "⏳ Waiting for database to be ready..."
MAX_ATTEMPTS=30
ATTEMPT=0
MIGRATIONS_DEPLOYED=false
log_debug "8" "Starting database wait loop" "{\"maxAttempts\":$MAX_ATTEMPTS}" "A"

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  # #region agent log
  # Use prisma migrate deploy as a readiness check; it's idempotent
  set +e
  DB_CHECK_OUTPUT=$(npx prisma migrate deploy 2>&1)
  DB_CHECK_EXIT=$?
  set -e
  log_debug "12" "Database connection attempt" "{\"attempt\":$ATTEMPT,\"exitCode\":$DB_CHECK_EXIT}" "A"
  if [ $DB_CHECK_EXIT -ne 0 ]; then
    echo "$DB_CHECK_OUTPUT" >&2
  fi
  # #endregion
  
  if [ $DB_CHECK_EXIT -eq 0 ]; then
    echo "✅ Database is ready!"
    log_debug "14" "Database connection successful" "{\"attempt\":$ATTEMPT}" "A"
    MIGRATIONS_DEPLOYED=true
    break
  fi
  ATTEMPT=$((ATTEMPT + 1))
  if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    echo "❌ Database connection timeout after $MAX_ATTEMPTS attempts"
    log_debug "19" "Database connection timeout" "{\"attempts\":$ATTEMPT}" "A"
    exit 1
  fi
  echo "   Database not ready, waiting 2 seconds... (attempt $ATTEMPT/$MAX_ATTEMPTS)"
  sleep 2
done

# Run migrations if they weren't already applied in the readiness check
if [ "$MIGRATIONS_DEPLOYED" != "true" ]; then
  echo "📦 Running database migrations..."
  log_debug "26" "Starting migrations" "{}" "B"
  # #region agent log
  MIGRATION_OUTPUT=$(npx prisma migrate deploy 2>&1)
  MIGRATION_EXIT=$?
  log_debug "27" "Migration execution completed" "{\"exitCode\":$MIGRATION_EXIT,\"outputLength\":${#MIGRATION_OUTPUT}}" "B"
  # #endregion

  if [ $MIGRATION_EXIT -ne 0 ]; then
    echo "⚠️  Migration failed, checking status..."
    log_debug "30" "Migration failed, checking status" "{\"exitCode\":$MIGRATION_EXIT}" "B"
    npx prisma migrate status || true
    echo "⚠️  If this is a fresh database, migrations should run automatically."
    echo "⚠️  If you see errors, you may need to manually resolve migrations."
  fi

  echo "✅ Migrations check completed!"
  log_debug "34" "Migrations check completed" "{}" "B"
else
  echo "✅ Migrations applied during readiness check."
  log_debug "34" "Migrations already applied in readiness check" "{}" "B"
fi

# Start the application
echo "🎉 Starting Next.js server..."
# #region agent log
SERVER_JS_EXISTS=$(test -f server.js && echo true || echo false)
PWD_CONTENTS=$(ls -la /app 2>/dev/null | head -20 | tr '\n' ';' || echo "cannot_list")
log_debug "37" "About to execute server command" "{\"cmd\":\"$*\",\"serverJsExists\":$SERVER_JS_EXISTS,\"pwd\":\"$(pwd)\",\"pwdContents\":\"$PWD_CONTENTS\"}" "C"
# #endregion

# Check if server.js exists, if not try to find it
if [ ! -f server.js ]; then
  echo "⚠️  server.js not found in current directory, searching..."
  # #region agent log
  log_debug "64" "server.js not found, searching" "{\"currentDir\":\"$(pwd)\"}" "C"
  # #endregion
  
  # Try common locations
  if [ -f .next/standalone/server.js ]; then
    echo "Found server.js in .next/standalone/"
    cd .next/standalone
    log_debug "69" "Found server.js in .next/standalone" "{}" "C"
  elif [ -f standalone/server.js ]; then
    echo "Found server.js in standalone/"
    cd standalone
    log_debug "73" "Found server.js in standalone" "{}" "C"
  else
    echo "❌ server.js not found anywhere!"
    # #region agent log
    FIND_RESULT=$(find /app -name "server.js" -type f 2>/dev/null | head -5 | tr '\n' ';' || echo "not_found")
    log_debug "77" "server.js search failed" "{\"findResult\":\"$FIND_RESULT\"}" "C"
    # #endregion
    exit 1
  fi
fi

# #region agent log
log_debug "82" "Executing server start command" "{\"command\":\"$1\",\"args\":\"$*\",\"workingDir\":\"$(pwd)\",\"serverJsExists\":$(test -f server.js && echo true || echo false)}" "D"
# #endregion

# Verify the command exists before executing
if ! command -v "$1" > /dev/null 2>&1 && [ ! -f "$1" ]; then
  echo "❌ Command not found: $1"
  log_debug "100" "Command not found" "{\"command\":\"$1\",\"path\":\"$(which $1 2>/dev/null || echo not_found)\"}" "D"
  exit 1
fi

# Execute with error handling
echo "Executing: $*"
log_debug "105" "About to exec command" "{\"fullCommand\":\"$*\"}" "D"
exec "$@"
