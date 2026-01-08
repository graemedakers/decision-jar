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

        if (!membership || membership.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Only the jar admin can empty the jar.' }, { status: 403 });
        }

        // Delete ALL ideas for this jar (including past dates)
        const result = await prisma.idea.deleteMany({
            where: {
                jarId
            }
        });

        return NextResponse.json({
            success: true,
            message: `Cleared ${result.count} ideas from the jar.`,
            count: result.count
        });
    } catch (error: any) {
        console.error('Error resetting jar:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message
        }, { status: 500 });
    }
}
