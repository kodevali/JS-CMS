"use server";

import { prisma } from "@/lib/db";
import { getSession as getJwtSession } from "@/lib/auth";
import { createUserSchema, updateUserSchema } from '@/lib/validation';

export async function getSession() {
    try {
        const session = await getJwtSession();
        
        // Debug logging to understand session structure
        if (process.env.NODE_ENV === 'development') {
            console.log('[AUTH] Session structure:', JSON.stringify(session, null, 2));
        }
        
        return session;
    } catch (error) {
        console.error('[AUTH] Error getting session:', error);
        return null;
    }
}

export async function getUsers() {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, createdAt: true }
        });
        console.log(`[AUTH_ACTION] getUsers: Found ${users.length} users`);
        return users;
    } catch (error) {
        console.error("[AUTH_ACTION] getUsers Error:", error);
        return [];
    }
}

import fs from 'fs';
import path from 'path';

export async function createUser(userData) {
    const logFile = path.join(process.cwd(), 'debug.log');
    const log = (msg) => {
        const entry = `[${new Date().toISOString()}] ${msg}\n`;
        fs.appendFileSync(logFile, entry);
        console.log(msg);
    };

    log(`[AUTH_ACTION] createUser called with: ${JSON.stringify(userData)}`);
    try {
        log("[AUTH_ACTION] Starting validation...");
        const validation = createUserSchema.safeParse(userData);
        if (!validation.success) {
            const issues = validation.error.issues || [];
            const errorMsg = issues[0]?.message || "Validation failed";
            log(`[AUTH_ACTION] createUser Validation Error: ${errorMsg} - Issues: ${JSON.stringify(issues)}`);
            return { error: errorMsg };
        }

        const { name, email, role } = validation.data;
        log(`[AUTH_ACTION] Validated: ${name}, ${email}, ${role}`);

        // Check if user already exists
        log("[AUTH_ACTION] Checking for existing user...");
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            log("[AUTH_ACTION] User already exists.");
            return { error: "A user with this email already exists." };
        }

        log("[AUTH_ACTION] Creating user in DB...");
        // Note: Users are typically auto-created via Google SSO, but this allows manual creation if needed
        const user = await prisma.user.create({
            data: {
                name,
                email,
                role
            },
            select: { id: true, name: true, email: true, role: true, createdAt: true }
        });

        log(`[AUTH_ACTION] createUser Success: ${email}`);
        return { success: true, user };
    } catch (error) {
        log("[AUTH_ACTION] createUser CRASHED:");
        log(`Error Name: ${error?.name}`);
        log(`Error Message: ${error?.message}`);
        log(`Error Stack: ${error?.stack}`);
        return { error: `Database Error: ${error.message || "Unknown error during user creation."}` };
    }
}

export async function deleteUser(id) {
    try {
        const deleted = await prisma.user.delete({
            where: { id }
        });
        return { success: true, user: deleted };
    } catch (error) {
        console.error("[AUTH_ACTION] deleteUser Error:", error);
        return { error: `Database Error: ${error.message || "Unknown error during user deletion."}` };
    }
}

export async function updateUser(userData) {
    try {
        const validation = updateUserSchema.safeParse(userData);
        if (!validation.success) {
            console.error("Validation Error:", validation.error);
            return null;
        }

        const { id, name, email, role } = validation.data;
        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (role) updateData.role = role;

        return await prisma.user.update({
            where: { id },
            data: updateData,
            select: { id: true, name: true, email: true, role: true, createdAt: true }
        });
    } catch (error) {
        console.error("Update User Error:", error);
        return { error: `Database Error: ${error.message || "Unknown error during user update."}` };
    }
}
