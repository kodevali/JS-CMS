# Multi-stage build for Next.js application
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl libssl3

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files and prisma schema (needed for postinstall script)
COPY package.json package-lock.json* ./
COPY prisma ./prisma

# Try npm ci first (faster and more reliable), fall back to npm install if lock file is out of sync
# Skip postinstall script during deps stage - we'll run prisma generate explicitly in builder stage
RUN npm ci --ignore-scripts || (echo "⚠️  package-lock.json out of sync, regenerating..." && rm -f package-lock.json && npm install --ignore-scripts)

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client (postinstall was skipped in deps stage)
RUN npx prisma generate

# Build Next.js
# Set a dummy DATABASE_URL for build time (actual URL will be provided at runtime)
ENV NEXT_TELEMETRY_DISABLED 1
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Install wget for health checks
RUN apk add --no-cache wget

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy Prisma files (needed for migrations and client)
COPY --from=builder /app/node_modules/.bin ./node_modules/.bin
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/prisma ./prisma

# Copy package.json for prisma commands
COPY --from=builder /app/package.json ./package.json

# Set correct permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Default DATABASE_URL so the app starts without any env (works with docker-compose postgres)
ENV DATABASE_URL="postgresql://jscms:changeme123@postgres:5432/jscms?schema=public"

# Use a startup script to handle migrations
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
