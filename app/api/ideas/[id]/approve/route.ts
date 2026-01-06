import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { awardXp } from '@/lib/gamification';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: ideaId } = await params;
        const session = await getSession();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Fetch Idea and check permission
        const idea = await prisma.idea.findUnique({
            where: { id: ideaId },
            include: { jar: { include: { members: true } } }
        });

        if (!idea) {
            return NextResponse.json({ error: "Idea not found" }, { status: 404 });
        }

        const isAdmin = idea.jar.members.some(m => m.userId === session.user.id && m.role === 'ADMIN');

        if (!isAdmin) {
            return NextResponse.json({ error: "Only admins can approve submissions" }, { status: 403 });
        }

        // 2. Approve the Idea
        const updatedIdea = await (prisma as any).idea.update({
            where: { id: ideaId },
            data: { status: 'APPROVED' }
        });

        // 3. Award XP to the Jar for the new content
        await awardXp(idea.jarId, 25); // Higher reward for curated content

        return NextResponse.json({ success: true, idea: updatedIdea });

    } catch (error) {
        console.error("Approve Idea Error", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
