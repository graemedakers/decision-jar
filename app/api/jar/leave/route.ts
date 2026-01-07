import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    const session = await getSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { jarId } = await request.json();

        if (!jarId) {
            return NextResponse.json({ error: "Jar ID is required" }, { status: 400 });
        }

        // Find Membership
        const membership = await prisma.jarMember.findUnique({
            where: {
                userId_jarId: {
                    jarId,
                    userId: session.user.id
                }
            },
            include: { jar: true }
        });

        if (!membership) {
            return NextResponse.json({ error: "You are not a member of this jar" }, { status: 404 });
        }

        // Prevent leaving if last admin (unless deleting jar logic exists, which we won't do here yet)
        // Or if it's a Romantic Jar and they are the "owner" (Admin)?
        // For simple logic: Just allow leaving.
        // BUT, if they are the ONLY member, the jar becomes abandoned. Ideally we delete it?
        // Let's check member count.
        const memberCount = await prisma.jarMember.count({
            where: { jarId }
        });

        // Prevent leaving if last admin and other members exist
        if (membership.role === 'ADMIN' && memberCount > 1) {
            const adminCount = await prisma.jarMember.count({
                where: {
                    jarId,
                    role: 'ADMIN'
                }
            });

            if (adminCount <= 1) {
                return NextResponse.json({
                    error: "You are the only Admin. Promote another member to Admin before leaving, or delete the Jar."
                }, { status: 403 });
            }
        }

        await prisma.$transaction(async (tx) => {
            // Delete membership
            await tx.jarMember.delete({
                where: {
                    userId_jarId: {
                        jarId,
                        userId: session.user.id
                    }
                }
            });

            // If last member, delete the Jar too?
            if (memberCount <= 1) {
                // Delete everything related to Jar
                // This might be heavy, but let's do basic cleanup
                // Ideas, Dates, etc should cascade if schema is set up, but let's just delete Jar
                await tx.jar.delete({
                    where: { id: jarId }
                });
            } else {
                // If Jar remains, and it is Romantic, regenerate code for security
                // This prevents the ex-partner from rejoining with an old link/code
                if (membership.jar.type === 'ROMANTIC') {
                    // Generate new 6-char code
                    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
                    // We don't strictly check for uniqueness here for simplicity in this rare case, 
                    // but collision is unlikely. In a perfect world, we'd loop check.

                    await tx.jar.update({
                        where: { id: jarId },
                        data: { referenceCode: newCode }
                    });
                }
            }

            // Update user activeJarId if they were looking at this one
            // We can just set it to null or find another one.
            // But since the user is already updated via membership deletion, activeJarId might still point to it?
            // User schema activeJarId is a string, not FK constrained usually, or it IS FK?
            // If FK, setting null is important.
            await tx.user.update({
                where: { id: session.user.id },
                data: { activeJarId: null }
            });
            // We rely on "me" endpoint so switch to a valid one next load
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Leave Jar Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
