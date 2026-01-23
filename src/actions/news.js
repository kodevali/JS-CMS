"use server";

import { prisma } from "@/lib/db";
import { createNewsSchema, updateNewsSchema } from "@/lib/validation";

export async function getNews() {
    try {
        const news = await prisma.news.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return news;
    } catch (error) {
        console.error("News Fetch Error:", error);
        return [];
    }
}

export async function createNews(data) {
    try {
        const validation = createNewsSchema.safeParse(data);
        if (!validation.success) {
            const errorMsg = validation.error.errors[0]?.message || "Validation failed";
            return { success: false, error: errorMsg };
        }

        const { title, summary, content, department, author, isFeatured, imageUrl } = validation.data;

        const news = await prisma.news.create({
            data: {
                title,
                summary,
                content,
                department,
                author,
                isFeatured: isFeatured || false,
                imageUrl
            }
        });
        return { success: true, news };
    } catch (error) {
        console.error("News Create Error:", error);
        return { success: false, error: error.message || "Database error" };
    }
}
export async function updateNews(data) {
    try {
        const validation = updateNewsSchema.safeParse(data);
        if (!validation.success) {
            const errorMsg = validation.error.errors[0]?.message || "Validation failed";
            return { success: false, error: errorMsg };
        }

        const { id, ...updateData } = validation.data;

        const news = await prisma.news.update({
            where: { id },
            data: updateData
        });
        return { success: true, news };
    } catch (error) {
        console.error("News Update Error:", error);
        return { success: false, error: error.message || "Database error" };
    }
}

export async function deleteNews(id) {
    try {
        if (!id) return { success: false, error: "ID is required" };
        await prisma.news.delete({
            where: { id }
        });
        return { success: true };
    } catch (error) {
        console.error("News Delete Error:", error);
        return { success: false, error: error.message || "Database error" };
    }
}

export async function seedITNews() {
    try {
        // Check if IT department already has posts
        const existingIT = await prisma.news.findFirst({
            where: { department: 'IT' }
        });

        if (existingIT) {
            console.log("[SEED] IT department already populated, skipping seed.");
            return { success: true, seeded: false };
        }

        console.log("[SEED] Initializing IT department with sample posts...");

        const itPosts = [
            {
                title: 'Transitioning to Zero-Trust: A Multi-Year Roadmap',
                summary: 'Our engineering teams are moving towards identity-based security perimeters to eliminate legacy VPN dependencies.',
                content: 'Full roadmap details inside.',
                department: 'IT',
                author: 'Sarah Chen',
                isFeatured: true,
                imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800'
            },
            {
                title: 'Q1 AI Infrastructure: GPU Cluster Scaling',
                summary: 'Successful deployment of H100 clusters to support cross-departmental predictive banking models.',
                content: 'Infrastructure scaling complete.',
                department: 'IT',
                author: 'David Rodriguez',
                isFeatured: true,
                imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800'
            },
            {
                title: 'Post-Quantum Cryptography in FinTech',
                summary: 'Exploring lattice-based encryption standards to future-proof customer ledger security.',
                content: 'Research phase documentation.',
                department: 'IT',
                author: 'Marcus Thorne',
                isFeatured: true,
                imageUrl: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=800'
            },
            {
                title: 'Edge Computing: Reducing Branch Latency',
                summary: 'Deploying k3s clusters at regional branch offices for sub-10ms transaction processing.',
                content: 'Edge deployment live.',
                department: 'IT',
                author: 'Anita Varma',
                isFeatured: false
            },
            {
                title: 'Cloud Cost Optimization: Serverless Migration',
                summary: 'Reducing operational overhead by 30% through targeted AWS Lambda transitions for non-critical services.',
                content: 'Cost audit results.',
                department: 'IT',
                author: 'Jason Kim',
                isFeatured: false
            },
            {
                title: 'Network Resilience: 100Gbps Backbone Upgrade',
                summary: 'Core data center interconnects now operating at 10x capacity with redundant fiber pathing.',
                content: 'Backbone live.',
                department: 'IT',
                author: 'Sarah Chen',
                isFeatured: false
            }
        ];

        await prisma.news.createMany({
            data: itPosts
        });

        console.log(`[SEED] Successfully seeded ${itPosts.length} IT posts.`);
        return { success: true, seeded: true, count: itPosts.length };
    } catch (error) {
        console.error("[SEED] IT News Seed Error:", error);
        return { success: false, error: error.message };
    }
}
