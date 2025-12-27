import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkAndPromoteWaitlist } from '@/lib/community';
import { NextResponse } from 'next/server';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: jarId } = await params;
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        // Check membership
        const membership = await prisma.jarMember.findUnique({
            where: {
                userId_jarId: { userId, jarId }
            }
        });

        if (!membership) {
            return NextResponse.json({ error: "Not a member" }, { status: 400 });
        }

        // Prevent last admin from leaving? (Optional, but good practice)
        if (membership.role === 'ADMIN') {
            const adminCount = await prisma.jarMember.count({
                where: { jarId, role: 'ADMIN', status: 'ACTIVE' }
            });
            if (adminCount <= 1) {
                return NextResponse.json({ error: "You are the only admin. Assign another admin before leaving or delete the jar." }, { status: 400 });
            }
        }

        // Remove member
        await prisma.jarMember.delete({
            where: { userId_jarId: { userId, jarId } }
        });

        // Trigger Waitlist Promotion
        await checkAndPromoteWaitlist(jarId);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Leave jar error", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
