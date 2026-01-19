import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

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

        const idea = await prisma.idea.findUnique({
            where: { id: ideaId },
            include: { jar: { include: { members: true } } }
        });

        if (!idea) {
            return NextResponse.json({ error: "Idea not found" }, { status: 404 });
        }

        const isAdmin = idea.jar.members.some(m => m.userId === session.user.id && (m.role === 'ADMIN' || m.role === 'OWNER'));

        if (!isAdmin) {
            return NextResponse.json({ error: "Only admins can reject submissions" }, { status: 403 });
        }

        // We ARCHIVE instead of delete to keep a record and prevent spam re-submissions 
        // (if we implement a duplicate check later)
        const updatedIdea = await (prisma as any).idea.update({
            where: { id: ideaId },
            data: { status: 'ARCHIVED' }
        });

        return NextResponse.json({ success: true, idea: updatedIdea });

    } catch (error) {
        console.error("Reject Idea Error", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
