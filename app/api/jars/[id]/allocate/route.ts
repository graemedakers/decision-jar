import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: jarId } = await params;
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { amountPerUser } = body;

        if (!amountPerUser || amountPerUser < 1) {
            return NextResponse.json({ error: "Invalid allocation amount" }, { status: 400 });
        }

        // 1. Verify access and admin status
        const membership = await prisma.jarMember.findUnique({
            where: {
                userId_jarId: {
                    userId: session.user.id,
                    jarId: jarId
                }
            }
        });

        if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
            return NextResponse.json({ error: "Only jar owners or admins can allocate tasks" }, { status: 403 });
        }

        // 2. Get all active members
        const members = await prisma.jarMember.findMany({
            where: {
                jarId: jarId,
                status: 'ACTIVE'
            },
            select: { userId: true }
        });

        if (members.length === 0) {
            return NextResponse.json({ error: "No active members to allocate to" }, { status: 400 });
        }

        // 3. Get unallocated, available ideas
        const availableIdeas = await prisma.idea.findMany({
            where: {
                jarId: jarId,
                selectedAt: null, // Still in jar
                assignedToId: null // Not yet assigned
            },
            select: { id: true }
        });

        const totalNeeded = members.length * amountPerUser;
        if (availableIdeas.length < totalNeeded) {
            return NextResponse.json({
                error: `Not enough ideas! You need ${totalNeeded} (${amountPerUser} per person), but only have ${availableIdeas.length} available.`
            }, { status: 400 });
        }

        // 4. Shuffle ideas
        const shuffled = availableIdeas.sort(() => 0.5 - Math.random());

        // 5. Distribute
        const updates = [];
        let ideaIndex = 0;

        for (const member of members) {
            for (let i = 0; i < amountPerUser; i++) {
                const idea = shuffled[ideaIndex];
                updates.push(
                    prisma.idea.update({
                        where: { id: idea.id },
                        data: {
                            assignedToId: member.userId,
                            // NOTE: We do NOT set selectedAt yet. 
                            // Concept: It is "Assigned" (In Progress), but technically not "Selected" (Out of Jar).
                            // OR, we mark it as selectedAt so it disappears from the "Spin" pool.
                            // Let's mark it as selectedAt = now() so it's removed from general pool?
                            // No, if we do that, we lose the visible date.
                            // But usually `selectedAt` implies "Done/Used".
                            // Let's keep selectedAt NULL so it shows in "Assigned" lists but filter it out of Random Spins.
                        }
                    })
                );
                ideaIndex++;
            }
        }

        await prisma.$transaction(updates);

        return NextResponse.json({ success: true, allocated: updates.length });

    } catch (error: any) {
        console.error("Allocation Error:", error);
        return NextResponse.json({ error: "Failed to allocate tasks" }, { status: 500 });
    }
}
