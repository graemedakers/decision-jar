import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ jarId: string }> }
) {
    try {
        const { jarId } = await params;
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { amountPerUser } = body;

        if (!jarId || !amountPerUser) {
            return NextResponse.json({ error: "Jar ID and amount are required" }, { status: 400 });
        }

        // Verify ownership (only OWNER can allocate)
        const membership = await prisma.jarMember.findUnique({
            where: {
                userId_jarId: {
                    userId: session.user.id,
                    jarId: jarId
                }
            }
        });

        if (!membership || membership.role !== 'OWNER') {
            return NextResponse.json({ error: "Only the jar owner can allocate tasks" }, { status: 403 });
        }

        // Get all active members
        const members = await prisma.jarMember.findMany({
            where: { jarId, status: 'ACTIVE' },
            select: { userId: true }
        });

        if (members.length === 0) {
            return NextResponse.json({ error: "No active members found" }, { status: 400 });
        }

        // Get all unassigned and unselected ideas
        const availableIdeas = await prisma.idea.findMany({
            where: {
                jarId,
                status: 'APPROVED',
                selectedAt: null,
                assignedToId: null
            },
            select: { id: true }
        });

        if (availableIdeas.length < (members.length * amountPerUser)) {
            return NextResponse.json({
                error: `Not enough unassigned ideas.Need ${members.length * amountPerUser}, have ${availableIdeas.length}.`
            }, { status: 400 });
        }

        // Shuffle ideas
        const shuffled = [...availableIdeas].sort(() => Math.random() - 0.5);

        // Assign ideas to members
        const assignments = await prisma.$transaction(
            members.flatMap((member, memberIdx) => {
                const start = memberIdx * amountPerUser;
                const memberIdeas = shuffled.slice(start, start + amountPerUser);

                return memberIdeas.map(idea =>
                    prisma.idea.update({
                        where: { id: idea.id },
                        data: { assignedToId: member.userId }
                    })
                );
            })
        );

        return NextResponse.json({
            success: true,
            allocated: assignments.length,
            perMember: amountPerUser
        });

    } catch (error: any) {
        console.error("Allocate Tasks API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message },
            { status: 500 }
        );
    }
}
