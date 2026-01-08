import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { awardXp } from '@/lib/gamification';
import { checkAndUnlockAchievements } from '@/lib/achievements';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Updated to match Next.js 15+ async params
) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const resolvedParams = await params;
        const id = resolvedParams.id;
        const { date } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'Idea ID is required' }, { status: 400 });
        }

        if (!date) {
            return NextResponse.json({ error: 'Date is required' }, { status: 400 });
        }

        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
            return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
        }

        // Verify ownership (or couple membership)
        const idea = await prisma.idea.findUnique({
            where: { id },
            select: { jarId: true }
        });

        if (!idea) {
            return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
        }

        // Check if user has access to this jar
        const membership = await prisma.jarMember.findUnique({
            where: {
                userId_jarId: {
                    userId: session.user.id,
                    jarId: idea.jarId
                }
            }
        });

        if (!membership) {
            return NextResponse.json({ error: 'Unauthorized. You do not have access to this jar.' }, { status: 403 });
        }

        const updatedIdea = await prisma.idea.update({
            where: { id },
            data: {
                selectedDate: dateObj
            }
        });

        // Gamification: Award 20 XP for committing to a date!
        await awardXp(idea.jarId, 20);
        await checkAndUnlockAchievements(idea.jarId);

        return NextResponse.json(updatedIdea);

    } catch (error: any) {
        console.error("Error updating idea date:", error);
        return NextResponse.json({ error: "Failed to update date" }, { status: 500 });
    }
}
