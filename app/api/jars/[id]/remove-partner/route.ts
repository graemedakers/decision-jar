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
        // 1. Check Admin
        const membership = await prisma.jarMember.findUnique({
            where: {
                userId_jarId: {
                    jarId,
                    userId: session.user.id
                }
            }
        });

        if (!membership || membership.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Only admins can remove partners' }, { status: 403 });
        }

        // 2. Find the "Partner" (any other member)
        const otherMember = await prisma.jarMember.findFirst({
            where: {
                jarId,
                userId: { not: session.user.id }
            }
        });

        if (!otherMember) {
            return NextResponse.json({ error: 'No partner found to remove' }, { status: 404 });
        }

        // 3. Remove them using Transaction (Clean up ideas etc)
        await prisma.$transaction(async (tx) => {
            // Remove their votes
            await tx.vote.deleteMany({
                where: {
                    userId: otherMember.userId,
                    OR: [
                        { session: { jarId } },
                        { idea: { jarId } }
                    ]
                }
            });

            // Remove their ideas in this jar
            await tx.idea.deleteMany({
                where: {
                    jarId,
                    createdById: otherMember.userId
                }
            });

            // Remove membership
            await tx.jarMember.delete({
                where: {
                    userId_jarId: {
                        userId: otherMember.userId,
                        jarId
                    }
                }
            });

            // Clear their active Jar if set to this
            await tx.user.updateMany({
                where: { id: otherMember.userId, activeJarId: jarId },
                data: { activeJarId: null }
            });
        });

        return NextResponse.json({
            success: true,
            message: 'Partner removed successfully'
        });

    } catch (error: any) {
        console.error('Error removing partner:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message
        }, { status: 500 });
    }
}
