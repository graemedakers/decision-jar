
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const session = await getSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { ideaIds } = body;

        if (!ideaIds || !Array.isArray(ideaIds) || ideaIds.length === 0) {
            return NextResponse.json({ error: 'No ideas selected' }, { status: 400 });
        }

        // Validate user entitlement to delete these ideas
        // We fetching the ideas to check permissions
        // A user can delete an idea if:
        // 1. They created it.
        // 2. They are the ADMIN/OWNER of the jar the idea belongs to.

        // Get all ideas
        const ideas = await prisma.idea.findMany({
            where: {
                id: { in: ideaIds }
            },
            include: {
                jar: {
                    include: {
                        members: {
                            where: { userId: session.user.id }
                        }
                    }
                }
            }
        });

        // Filter for deletable IDs
        const deletableIds = ideas.filter(idea => {
            const isCreator = idea.createdById === session.user.id;
            const membership = idea.jar.members[0];
            const isAdmin = membership && (membership.role === 'ADMIN' || membership.role === 'OWNER');

            return isCreator || isAdmin;
        }).map(i => i.id);

        if (deletableIds.length === 0) {
            return NextResponse.json({ error: 'No permissions to delete selected ideas' }, { status: 403 });
        }

        // Perform Bulk Delete
        const result = await prisma.idea.deleteMany({
            where: {
                id: { in: deletableIds }
            }
        });

        return NextResponse.json({
            success: true,
            count: result.count,
            message: `Successfully deleted ${result.count} ideas`
        });

    } catch (error: any) {
        console.error('Bulk delete error:', error);
        return NextResponse.json({ error: 'Failed to delete ideas' }, { status: 500 });
    }
}
