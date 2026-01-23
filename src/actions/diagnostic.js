"use server";

import { prisma } from "@/lib/db";

export async function checkDatabaseConnection() {
    try {
        console.log("[DIAGNOSTIC] Prisma Keys:", Object.keys(prisma).filter(k => k[0] !== '$' && k[0] !== '_'));
        console.log("[DIAGNOSTIC] prisma.user type:", typeof prisma.user);

        // Use safer access
        const userCount = prisma.user ? await prisma.user.count() : -1;
        const newsCount = prisma.news ? await prisma.news.count() : -1;
        const settingsCount = prisma.systemSetting ? await prisma.systemSetting.count() : -1;

        return {
            connected: true,
            stats: {
                users: userCount,
                news: newsCount,
                settings: settingsCount
            },
            database_url: process.env.DATABASE_URL
        };
    } catch (error) {
        console.error("[DIAGNOSTIC] Database Connection Failed!");
        console.error("[DIAGNOSTIC] Error Name:", error.name);
        console.error("[DIAGNOSTIC] Error Message:", error.message);
        console.error("[DIAGNOSTIC] Current Dir:", process.cwd());
        console.error("[DIAGNOSTIC] DATABASE_URL:", process.env.DATABASE_URL);

        return {
            connected: false,
            error: `${error.name}: ${error.message}`
        };
    }
}
