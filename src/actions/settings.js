"use server";

import { prisma } from "@/lib/db";
import { getSession } from "./auth";
import { PrismaClient } from "@prisma/client";

// Fail-safe helper for dev environments where schema changes don't propagate to the singleton
function getClient() {
    if (prisma.systemSetting) return prisma;
    console.log("[SETTINGS] Global prisma.systemSetting is missing. Using fresh client fallback.");
    // Let Prisma handle DATABASE_URL automatically (resolves relative to schema.prisma)
    return new PrismaClient();
}

export async function getSystemSetting(key) {
    try {
        const client = getClient();
        const setting = await client.systemSetting.findUnique({
            where: { key }
        });
        return setting?.value || "";
    } catch (error) {
        console.error(`[SETTINGS] Error getting ${key}:`, error);
        return "";
    }
}

export async function updateSystemSetting(key, value) {
    try {
        const client = getClient();
        const session = await getSession();
        if (session?.user?.role !== 'Admin') {
            return { error: "Permission Denied: Only Admins can update system settings." };
        }

        const setting = await client.systemSetting.upsert({
            where: { key },
            update: { value },
            create: { key, value }
        });

        console.log(`[SETTINGS] Updated ${key} to: ${value}`);
        return { success: true, setting };
    } catch (error) {
        console.error(`[SETTINGS] Error updating ${key}:`, error);
        return { error: `Database Error: ${error.message || "Unknown error"}` };
    }
}
