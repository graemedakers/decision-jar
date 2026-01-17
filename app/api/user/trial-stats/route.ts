import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/user/trial-stats
 * Returns personalized usage statistics for the trial expiry modal
 */
export async function GET() {
    const session = await getSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const userId = session.user.id;

        // Get user creation date for days active calculation
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { createdAt: true }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Count ideas created by user
        const ideasCreated = await prisma.idea.count({
            where: { createdById: userId }
        });

        // Count distinct days with activity (ideas created)
        const ideaDates = await prisma.idea.findMany({
            where: {
                createdById: userId
            },
            select: { createdAt: true }
        });

        // Get unique dates
        const uniqueDates = new Set<string>();
        ideaDates.forEach(idea => {
            if (idea.createdAt) {
                uniqueDates.add(idea.createdAt.toISOString().split('T')[0]);
            }
        });

        // Estimate concierge uses based on ideas with specific categories
        // that are typically created via AI concierge tools
        const conciergeCategories = ['FOOD', 'DATE', 'ACTIVITY', 'EXPERIENCE', 'ENTERTAINMENT'];
        const conciergeIdeas = await prisma.idea.count({
            where: {
                createdById: userId,
                category: {
                    in: conciergeCategories
                }
            }
        });

        return NextResponse.json({
            conciergeUses: Math.min(conciergeIdeas, ideasCreated), // Conservative estimate
            ideasCreated,
            daysActive: uniqueDates.size,
        });

    } catch (error) {
        console.error("[TRIAL_STATS] Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
