import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string, userId: string }> }
) {
    const session = await getSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: jarId, userId: targetUserId } = await params;
    const { role } = await request.json();

    if (!['ADMIN', 'MEMBER'].includes(role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    try {
        // 1. Verify the requester is an ADMIN of this jar
        const requesterMembership = await prisma.jarMember.findUnique({
            where: {
                userId_jarId: {
                    userId: session.user.id,
                    jarId: jarId
                }
            }
        });

        if (!requesterMembership || requesterMembership.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Only admins can change roles' }, { status: 403 });
        }

        // 2. If demoting to MEMBER, ensure there's at least one OTHER admin
        if (role === 'MEMBER') {
            const adminCount = await prisma.jarMember.count({
                where: {
                    jarId: jarId,
                    role: 'ADMIN',
                    userId: { not: targetUserId }
                }
            });

            if (adminCount === 0) {
                return NextResponse.json({
                    error: 'Cannot demote the last administrator. Promote another member first.'
                }, { status: 400 });
            }
        }

        // 3. Update the role
        const updatedMembership = await prisma.jarMember.update({
            where: {
                userId_jarId: {
                    userId: targetUserId,
                    jarId: jarId
                }
            },
            data: { role }
        });

        return NextResponse.json(updatedMembership);
    } catch (error) {
        console.error('Failed to update member role:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string, userId: string }> }
) {
    const session = await getSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: jarId, userId: targetUserId } = await params;

    try {
        // 1. Verify the requester is an ADMIN of this jar
        const requesterMembership = await prisma.jarMember.findUnique({
            where: {
                userId_jarId: {
                    userId: session.user.id,
                    jarId: jarId
                }
            }
        });

        if (!requesterMembership || requesterMembership.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Only admins can remove members' }, { status: 403 });
        }

        // 2. Ensure we aren't removing the last admin
        const targetMembership = await prisma.jarMember.findUnique({
            where: {
                userId_jarId: {
                    userId: targetUserId,
                    jarId: jarId
                }
            }
        });

        if (!targetMembership) {
            return NextResponse.json({ error: 'Member not found' }, { status: 404 });
        }

        if (targetMembership.role === 'ADMIN') {
            const adminCount = await prisma.jarMember.count({
                where: {
                    jarId: jarId,
                    role: 'ADMIN',
                    userId: { not: targetUserId }
                }
            });

            if (adminCount === 0) {
                return NextResponse.json({
                    error: 'Cannot remove the last administrator. Promote another member first.'
                }, { status: 400 });
            }
        }

        // 3. Delete the membership
        await prisma.jarMember.delete({
            where: {
                userId_jarId: {
                    userId: targetUserId,
                    jarId: jarId
                }
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to remove member:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
