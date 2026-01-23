"use server";

import { prisma } from "@/lib/db";
import { createFileSchema } from "@/lib/validation";

export async function getFiles() {
    try {
        const files = await prisma.file.findMany({
            orderBy: { uploadedAt: 'desc' }
        });
        return files;
    } catch (error) {
        console.error("File Fetch Error:", error);
        return [];
    }
}

export async function uploadFile(rawData) {
    try {
        const validation = createFileSchema.safeParse(rawData);
        if (!validation.success) {
            console.error("Validation Error:", validation.error);
            return null;
        }

        const data = validation.data;

        // SECURITY NOTE: Storing Base64 in DB is not optimal for large files, but acceptable for this local demo.
        // In production, use file system or S3 and store path.
        const file = await prisma.file.create({
            data: {
                name: data.name,
                size: data.size,
                type: data.type,
                department: data.department,
                previewUrl: data.previewUrl, // Storing the base64 string
                uploaderEmail: data.uploaderEmail
            }
        });
        return file;
    } catch (error) {
        console.error("File Upload Error:", error);
        return null;
    }
}

export async function deleteFile(id, currentUser) {
    if (!currentUser) return false;

    try {
        const file = await prisma.file.findUnique({
            where: { id }
        });

        if (!file) return false;

        // PERMISSION CHECK
        // Admin can delete anything.
        // Editors can delete their own files.
        // Viewers cannot delete.
        const isAdmin = currentUser.role === 'Admin';
        const isOwner = file.uploaderEmail === currentUser.email;
        const isEditor = currentUser.role.includes('Editor');

        if (isAdmin || (isEditor && isOwner)) {
            await prisma.file.delete({
                where: { id }
            });
            return true;
        }

        console.error("Permission Denied: User cannot delete this file.");
        return false;
    } catch (error) {
        console.error("File Delete Error:", error);
        return false;
    }
}
