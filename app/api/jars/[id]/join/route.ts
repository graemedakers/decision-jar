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

        const jar = await prisma.jar.findUnique({
            where: { id: jarId },
            include: {
                _count: {
                    select: { members: { where: { status: 'ACTIVE' } } }
                }
            }
        });

        if (!jar) {
            return NextResponse.json({ error: "Jar not found" }, { status: 404 });
        }

        // Check existing membership
        const existingMember = await prisma.jarMember.findUnique({
            where: {
                userId_jarId: {
                    userId: session.user.id,
                    jarId: jarId
                }
            }
        });

        if (existingMember) {
            return NextResponse.json({
                error: "Already a member or request pending",
                status: existingMember.status
            }, { status: 400 });
        }

        // Create Member (Default to ACTIVE since community jar limits are removed)
        const status = 'ACTIVE';

        // Create Member
        await prisma.jarMember.create({
            data: {
                userId: session.user.id,
                jarId: jarId,
                role: 'MEMBER',
                status: status as any
            }
        });

        return NextResponse.json({ status });

    } catch (error) {
        console.error("Join Error", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
