import { z } from 'zod';

export const createUserSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    role: z.enum(["Viewer", "HR Editor", "Comms Editor", "IT Editor", "Admin"]).default("Viewer")
});

export const createNewsSchema = z.object({
    title: z.string().min(1, "Title is required").max(100, "Title too long"),
    summary: z.string().min(1, "Summary is required").max(500, "Summary too long"),
    content: z.string().min(1, "Content is required"),
    department: z.string(),
    author: z.string(),
    isFeatured: z.boolean().optional(),
    imageUrl: z.string().optional().nullable() // Base64 or URL
});

export const createFileSchema = z.object({
    name: z.string().min(1, "File name is required"),
    size: z.number().positive("Size must be positive"),
    type: z.string(),
    department: z.string(),
    previewUrl: z.string().optional(),
    uploaderEmail: z.string().optional()
});

export const updateUserSchema = z.object({
    id: z.string(),
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    email: z.string().email("Invalid email address").optional(),
    role: z.enum(["Viewer", "HR Editor", "Comms Editor", "IT Editor", "Admin"]).optional()
});

export const updateNewsSchema = z.object({
    id: z.string(),
    title: z.string().min(1, "Title is required").max(100, "Title too long").optional(),
    summary: z.string().min(1, "Summary is required").max(500, "Summary too long").optional(),
    content: z.string().min(1, "Content is required").optional(),
    department: z.string().optional(),
    author: z.string().optional(),
    isFeatured: z.boolean().optional(),
    imageUrl: z.string().optional().nullable()
});
