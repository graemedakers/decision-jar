import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: jarId } = await params;

    try {
        // Verify user is a member of this jar
        const membership = await prisma.jarMember.findUnique({
            where: {
                userId_jarId: {
                    userId: session.user.id,
                    jarId: jarId
                }
            }
        });

        if (!membership || membership.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Only administrators can view member lists.' }, { status: 403 });
        }

        const [members, jar] = await Promise.all([
            prisma.jarMember.findMany({
                where: { jarId: jarId },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            // @ts-ignore
                            image: true
                        }
                    }
                },
                orderBy: { joinedAt: 'asc' }
            }),
            prisma.jar.findUnique({
                where: { id: jarId },
                select: { referenceCode: true }
            })
        ]);

        return NextResponse.json({
            members,
            referenceCode: jar?.referenceCode
        });
    } catch (error) {
        console.error('Failed to fetch jar members:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
