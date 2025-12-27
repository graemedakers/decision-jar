import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: jarId } = await params;
        const session = await getSession();

        const jar = await prisma.jar.findUnique({
            where: { id: jarId },
            include: {
                _count: {
                    select: { members: true }
                    // We might filter for 'ACTIVE' ideally, but _count on relation usually counts all row.
                    // If we want filtered count, we need more complex query or assume all are active for simplified count
                    // But we added 'status', so let's refine if possible.
                }
            }
        });

        if (!jar) {
            return NextResponse.json({ error: "Jar not found" }, { status: 404 });
        }

        // Get accurate member count (active only)
        const activeCount = await prisma.jarMember.count({
            where: { jarId, status: 'ACTIVE' }
        });

        const isFull = jar.memberLimit ? activeCount >= jar.memberLimit : false;

        let membershipStatus = 'NONE';
        let isAdmin = false;

        if (session?.user?.id) {
            const member = await prisma.jarMember.findUnique({
                where: { userId_jarId: { userId: session.user.id, jarId } }
            });
            if (member) {
                membershipStatus = member.status;
                isAdmin = member.role === 'ADMIN';
            }
        }

        return NextResponse.json({
            id: jar.id,
            name: jar.name,
            description: jar.description,
            imageUrl: jar.imageUrl,
            memberCount: activeCount,
            memberLimit: jar.memberLimit,
            isFull,
            membershipStatus,
            isAdmin
        });

    } catch (error) {
        console.error("Public Details Error", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
