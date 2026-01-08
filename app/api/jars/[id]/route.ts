import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();

        // Fetch the user
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                memberships: {
                    where: { jarId: id },
                    include: { jar: true }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if user is an admin of this jar
        const membership = user.memberships.find(m => m.jarId === id);
        if (!membership || membership.role !== 'ADMIN') {
            return NextResponse.json({ error: "Only admins can update jar settings" }, { status: 403 });
        }

        // Update the jar with provided fields
        const updateData: any = {};

        if (body.name !== undefined) updateData.name = body.name;
        if (body.description !== undefined) updateData.description = body.description;
        if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
        if (body.topic !== undefined) updateData.topic = body.topic;
        if (body.memberLimit !== undefined) {
            updateData.memberLimit = body.memberLimit === null ? null : parseInt(body.memberLimit);
        }
        if (body.customCategories !== undefined) updateData.customCategories = body.customCategories;
        if (body.isCommunityJar !== undefined) updateData.isCommunityJar = body.isCommunityJar;
        if (body.selectionMode !== undefined) updateData.selectionMode = body.selectionMode;

        // Auto-detect community jar: if memberLimit is set, it's likely a community jar
        if (body.memberLimit !== undefined && !membership.jar.isCommunityJar) {
            updateData.isCommunityJar = true;
        }

        const updatedJar = await prisma.jar.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json(updatedJar);
    } catch (error: any) {
        console.error("[JAR_UPDATE_ERROR]", error);
        return NextResponse.json({
            error: error?.message || "Internal Server Error"
        }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        // Verify Admin Role
        const membership = await prisma.jarMember.findFirst({
            where: {
                jarId: id,
                userId: session.user.id
            }
        });

        if (!membership || membership.role !== 'ADMIN') {
            return NextResponse.json({ error: "Forbidden: Only admins can delete a jar." }, { status: 403 });
        }

        // Clean up all related records in a transaction to satisfy Foreign Keys
        await prisma.$transaction(async (tx) => {
            // 1. Clear activeJarId for users who had this jar active
            await tx.user.updateMany({
                where: { activeJarId: id },
                data: { activeJarId: null }
            });

            // 2. Delete Votes (Must be before VoteSession and Idea)
            await tx.vote.deleteMany({
                where: {
                    OR: [
                        { session: { jarId: id } },
                        { idea: { jarId: id } }
                    ]
                }
            });

            // 3. Delete Vote Sessions
            await tx.voteSession.deleteMany({ where: { jarId: id } });

            // 4. Delete Unlocked Achievements
            await tx.unlockedAchievement.deleteMany({ where: { jarId: id } });

            // 5. Delete Favorite Venues
            await tx.favoriteVenue.deleteMany({ where: { jarId: id } });

            // 6. Delete Deleted Logs
            await tx.deletedLog.deleteMany({ where: { jarId: id } });

            // 7. Delete Ideas (Ratings cascade automatically)
            await tx.idea.deleteMany({ where: { jarId: id } });

            // 8. Delete Memberships
            await tx.jarMember.deleteMany({ where: { jarId: id } });

            // 9. Finally, Delete the Jar
            await tx.jar.delete({ where: { id: id } });
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Delete Error:", error);
        return NextResponse.json({
            error: `Failed to delete jar: ${error.message || "Unknown error"}`
        }, { status: 500 });
    }
}
