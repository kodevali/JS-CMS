
import { PrismaClient } from '@prisma/client';
import path from 'path';
import { existsSync } from 'fs';

const globalForPrisma = global;

// In dev, we use a global variable so that the value is preserved across hot reloads
// across different files. In prod, we just create a new one.
let prismaInstance = globalForPrisma.prisma;

// Verifying the instance is healthy (has models) before using it
if (prismaInstance && !prismaInstance.user) {
    console.log("[DB] Prisma instance missing 'user' model. Forcing refresh...");
    prismaInstance = null;
    globalForPrisma.prisma = null;
}

if (!prismaInstance) {
    // Validate DATABASE_URL is set (allow dummy URL during build)
    const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                       (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('dummy'));
    
    if (!process.env.DATABASE_URL && !isBuildTime) {
        throw new Error(
            'DATABASE_URL environment variable is not set. ' +
            'For local development: DATABASE_URL="file:./prisma/dev.db" ' +
            'For production: DATABASE_URL="postgresql://user:password@host:5432/dbname"'
        );
    }
    
    // Let Prisma handle the DATABASE_URL automatically from environment variables
    // Prisma resolves relative paths relative to the schema.prisma file location
    // During build, Prisma Client is created but won't connect until first query at runtime
    prismaInstance = new PrismaClient({
        // Prisma will only connect when a query is made, not during initialization
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaInstance;

export const prisma = prismaInstance;
