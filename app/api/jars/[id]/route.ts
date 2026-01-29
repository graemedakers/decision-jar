import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();

        // Fetch the user
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                memberships: {
                    where: { jarId: id },
                    include: { jar: true }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if user is an admin or owner of this jar
        const membership = user.memberships.find(m => m.jarId === id);
        if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
            return NextResponse.json({ error: "Only admins can update jar settings" }, { status: 403 });
        }

        // Update the jar with provided fields
        const updateData: any = {};

        if (body.name !== undefined) updateData.name = body.name;
        if (body.topic !== undefined) updateData.topic = body.topic;
        if (body.customCategories !== undefined) updateData.customCategories = body.customCategories;
        if (body.selectionMode !== undefined) {
            if (body.selectionMode === 'VOTE') {
                const jar = membership.jar;
                if (jar.isMysteryMode) {
                    return NextResponse.json({ error: "Voting is not allowed for mystery jars" }, { status: 400 });
                }
                const memberCount = await prisma.jarMember.count({
                    where: { jarId: id, status: 'ACTIVE' }
                });
                if (memberCount < 3) {
                    return NextResponse.json({ error: "Group voting requires at least 3 members" }, { status: 400 });
                }
            }
            updateData.selectionMode = body.selectionMode;
        }
        if (body.voteCandidatesCount !== undefined) updateData.voteCandidatesCount = Number(body.voteCandidatesCount);
        if (body.defaultIdeaPrivate !== undefined) updateData.defaultIdeaPrivate = !!body.defaultIdeaPrivate;

        const updatedJar = await prisma.jar.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json(updatedJar);
    } catch (error: any) {
        console.error("[JAR_UPDATE_ERROR]", error);
        return NextResponse.json({
            error: error?.message || "Internal Server Error"
        }, { status: 500 });
    }
}

export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    try {
        const jar = await prisma.jar.findUnique({
            where: { id },
            include: {
                members: {
                    select: { userId: true, role: true }
                },
                _count: {
                    select: { ideas: true }
                }
            }
        });

        if (!jar) {
            return NextResponse.json({ error: "Jar not found" }, { status: 404 });
        }

        // Verify membership access
        const isMember = jar.members.some(m => m.userId === session.user?.id);
        if (!isMember) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json(jar);
    } catch (error: any) {
        console.error("[JAR_GET_ERROR]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        // Verify Admin Role
        const membership = await prisma.jarMember.findFirst({
            where: {
                jarId: id,
                userId: session.user.id
            }
        });

        if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
            return NextResponse.json({ error: "Forbidden: Only admins can delete a jar." }, { status: 403 });
        }

        // Clean up all related records in a transaction
        // Most related records (Ideas, Members, Votes, etc.) now use onDelete: Cascade
        await prisma.$transaction(async (tx) => {
            // 1. Clear activeJarId for users who had this jar active (Cross-model, no cascade)
            await tx.user.updateMany({
                where: { activeJarId: id },
                data: { activeJarId: null }
            });

            // 2. Cleanup GiftTokens where this jar is the source
            // Any jars cloned from these gifts will have their sourceGiftId set to null
            const gifts = await tx.giftToken.findMany({
                where: { sourceJarId: id },
                select: { id: true }
            });
            const giftIds = gifts.map(g => g.id);

            if (giftIds.length > 0) {
                // Remove links from any jars cloned from these gifts
                await tx.jar.updateMany({
                    where: { sourceGiftId: { in: giftIds } },
                    data: { sourceGiftId: null }
                });

                // Delete the gift tokens themselves (GiftToken relation to Jar is Cascade, but we do it explicitly here for clarity of the gifts we're also cleaning up links for)
                await tx.giftToken.deleteMany({
                    where: { id: { in: giftIds } }
                });
            }

            // 3. Finally, Delete the Jar (This triggers all database-level cascades)
            await tx.jar.delete({ where: { id: id } });
        }, {
            timeout: 20000 // Increase timeout to 20s for large jars
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Delete Error:", error);
        return NextResponse.json({
            error: `Failed to delete jar: ${error.message || "Unknown error"}`
        }, { status: 500 });
    }
}
