import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: jarId } = await context.params;

    try {
        // Verify current user is an ADMIN of the jar
        const membership = await prisma.jarMember.findUnique({
            where: {
                userId_jarId: {
                    jarId,
                    userId: session.user.id
                }
            }
        });

        if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
            return NextResponse.json({ error: 'Only the jar owner or admin can empty the jar.' }, { status: 403 });
        }

        // 1. Get contexts for cleanup
        const ideas = await prisma.idea.findMany({
            where: { jarId },
            select: { id: true }
        });
        const ideaIds = ideas.map(i => i.id);

        // Get sessions in this jar to clean their votes too (redundancy check)
        const sessions = await prisma.voteSession.findMany({
            where: { jarId },
            select: { id: true }
        });
        const sessionIds = sessions.map(s => s.id);

        let deletedCount = 0;

        // 2. Use transaction to clean up dependencies first
        await prisma.$transaction(async (tx) => {
            // A. Update sessions to remove winners (so we can delete the ideas)
            // We update ALL sessions in the jar, not just ones linked to these ideas, to be safe.
            if (sessionIds.length > 0) {
                await tx.voteSession.updateMany({
                    where: { id: { in: sessionIds } },
                    data: { winnerId: null }
                });
            }

            // B. Delete Votes
            // Delete votes by Idea ID (primary constraint) AND by Session ID (cleanup)
            if (ideaIds.length > 0) {
                await tx.vote.deleteMany({
                    where: { ideaId: { in: ideaIds } }
                });
            }
            // Also cleanup any votes in these sessions that might somehow point elsewhere (orphan safeguard)
            if (sessionIds.length > 0) {
                await tx.vote.deleteMany({
                    where: { sessionId: { in: sessionIds } }
                });
            }

            // C. Delete the Ideas
            // Ratings generate via Cascade delete on Idea, so we don't need to manually delete them.
            const result = await tx.idea.deleteMany({
                where: { jarId }
            });

            deletedCount = result.count;
        });

        return NextResponse.json({
            success: true,
            message: `Cleared ${deletedCount} ideas from the jar.`,
            count: deletedCount
        });
    } catch (error: any) {
        console.error('Error resetting jar:', error);
        // Serialize error properly
        const errorMessage = error?.message || (typeof error === 'string' ? error : JSON.stringify(error));
        return NextResponse.json({
            error: 'Internal Server Error',
            details: errorMessage
        }, { status: 500 });
    }
}
