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
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify Admin Access
        const membership = await prisma.jarMember.findUnique({
            where: {
                userId_jarId: { userId: session.user.id, jarId }
            }
        });

        if (!membership || membership.role !== 'ADMIN') {
            return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }

        const members = await prisma.jarMember.findMany({
            where: { jarId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            },
            orderBy: { joinedAt: 'desc' }
        });

        return NextResponse.json(members.map(m => ({
            id: m.id,
            userId: m.user.id,
            name: m.user.name,
            email: m.user.email,
            role: m.role,
            status: m.status,
            joinedAt: m.joinedAt
        })));

    } catch (error) {
        console.error("Fetch members error", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
