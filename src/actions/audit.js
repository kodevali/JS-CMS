"use server";

import { prisma } from "@/lib/db";

export async function logAction(action, details, user) {
    if (!user) return;

    try {
        await prisma.auditLog.create({
            data: {
                action,
                details,
                userEmail: user.email || user.name,
                status: 'SUCCESS'
            }
        });
    } catch (error) {
        console.error("Audit Log Error:", error);
    }
}

export async function getAuditLogs() {
    try {
        return await prisma.auditLog.findMany({
            orderBy: { timestamp: 'desc' },
            take: 100
        });
    } catch (error) {
        return [];
    }
}
