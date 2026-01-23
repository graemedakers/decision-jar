import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

        // Prevent last admin/owner from leaving
        if (['ADMIN', 'OWNER'].includes(membership.role)) {
            const adminCount = await prisma.jarMember.count({
                where: { jarId, role: { in: ['ADMIN', 'OWNER'] }, status: 'ACTIVE' }
            });
            if (adminCount <= 1) {
                return NextResponse.json({ error: "You are the only admin/owner. Assign another admin before leaving or delete the jar." }, { status: 400 });
            }
        }

        // Remove member
        await prisma.jarMember.delete({
            where: { userId_jarId: { userId, jarId } }
        });

        // Auto-revert to RANDOM if members < 3
        const jar = await prisma.jar.findUnique({
            where: { id: jarId },
            select: { selectionMode: true }
        });

        if (jar?.selectionMode === 'VOTE') {
            const memberCount = await prisma.jarMember.count({
                where: { jarId, status: 'ACTIVE' }
            });
            if (memberCount < 3) {
                await prisma.jar.update({
                    where: { id: jarId },
                    data: { selectionMode: 'RANDOM' }
                });
            }
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Leave jar error", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
