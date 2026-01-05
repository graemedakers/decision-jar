
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@/lib/auth";

const prisma = new PrismaClient();

// Next.js 15+ changed params to be a Promise
type Context = {
    params: Promise<{ id: string }> | { id: string }
};

export async function DELETE(req: NextRequest, props: Context) {
    const session = await getSession();
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await params safely for both Next 13/14 and 15
    const params = await props.params;
    const jarId = params.id;

    if (!jarId) {
        console.error("Delete Error: JAR ID Missing");
        return NextResponse.json({ error: "Jar ID missing" }, { status: 400 });
    }

    console.log(`[DELETE JAR] Processing request for Jar ID: ${jarId} by User: ${session.user.id}`);

    try {
        // Verify Admin Role
        const membership = await prisma.jarMember.findFirst({
            where: {
                jarId: jarId,
                userId: session.user.id
            }
        });

        if (!membership || membership.role !== 'ADMIN') {
            return NextResponse.json({ error: "Forbidden: Only admins can delete a jar." }, { status: 403 });
        }

        // Clean up all related records in a transaction to satisfy Foreign Keys
        await prisma.$transaction(async (tx) => {
            console.log(`[DELETE JAR] Starting cleanup for ${jarId}...`);

            // 1. Remove Legacy User links
            await tx.user.updateMany({
                where: { coupleId: jarId },
                data: { coupleId: null }
            });

            // 2. Clear activeJarId for users who had this jar active
            await tx.user.updateMany({
                where: { activeJarId: jarId },
                data: { activeJarId: null }
            });

            // 2. Delete Votes (Must be before VoteSession and Idea)
            // Votes linked to Sessions in this Jar AND Votes linked to Ideas in this Jar
            await tx.vote.deleteMany({
                where: {
                    OR: [
                        { session: { jarId: jarId } },
                        { idea: { jarId: jarId } }
                    ]
                }
            });

            // 3. Delete Vote Sessions
            await tx.voteSession.deleteMany({ where: { jarId } });

            // 4. Delete Unlocked Achievements
            await tx.unlockedAchievement.deleteMany({ where: { jarId } });

            // 5. Delete Favorite Venues
            await tx.favoriteVenue.deleteMany({ where: { jarId } });

            // 6. Delete Deleted Logs
            await tx.deletedLog.deleteMany({ where: { jarId } });

            // 7. Delete Ideas (Ratings cascade automatically)
            await tx.idea.deleteMany({ where: { jarId } });

            // 8. Delete Memberships
            await tx.jarMember.deleteMany({ where: { jarId } });

            // 9. Finally, Delete the Jar
            console.log(`[DELETE JAR] Deleting Main Jar Record: ${jarId}`);
            // Explicitly assert jarId type if needed, but it should be string
            await tx.jar.delete({ where: { id: jarId } });
        });

        console.log(`[DELETE JAR] Success.`);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Delete Error:", error);
        // Return detailed error message for debugging
        return NextResponse.json({
            error: `Failed to delete jar: ${error.message || "Unknown error"}`
        }, { status: 500 });
    }
}
