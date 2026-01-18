import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { NextResponse } from 'next/server';


export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string, userId: string }> }
) {
    try {
        const { id: jarId, userId: targetUserId } = await params;
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify Admin Access (OWNER or ADMIN can delete)
        const adminMembership = await prisma.jarMember.findUnique({
            where: {
                userId_jarId: { userId: session.user.id, jarId }
            }
        });

        if (!adminMembership || !['OWNER', 'ADMIN'].includes(adminMembership.role)) {
            return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }

        // Get target member
        const targetMember = await prisma.jarMember.findUnique({
            where: { userId_jarId: { userId: targetUserId, jarId } }
        });

        if (!targetMember) {
            return NextResponse.json({ error: "Member not found" }, { status: 404 });
        }

        // Prevent removing OWNER
        if (targetMember.role === 'OWNER') {
            return NextResponse.json({
                error: "Cannot remove the jar owner. Transfer ownership first."
            }, { status: 403 });
        }

        // Check if this is the last admin
        if (['OWNER', 'ADMIN'].includes(targetMember.role)) {
            const adminCount = await prisma.jarMember.count({
                where: {
                    jarId,
                    role: { in: ['OWNER', 'ADMIN'] }
                }
            });

            if (adminCount <= 1) {
                return NextResponse.json({
                    error: "Cannot remove the last administrator. This would orphan the jar."
                }, { status: 403 });
            }
        }

        // Delete the member
        await prisma.jarMember.delete({
            where: { userId_jarId: { userId: targetUserId, jarId } }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Delete member error", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string, userId: string }> }
) {
    try {
        const { id: jarId, userId: targetUserId } = await params;
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { role } = body;

        if (!role || !['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'].includes(role)) {
            return NextResponse.json({ error: "Invalid role" }, { status: 400 });
        }

        // Verify Admin Access (OWNER or ADMIN can change roles)
        const adminMembership = await prisma.jarMember.findUnique({
            where: {
                userId_jarId: { userId: session.user.id, jarId }
            }
        });

        if (!adminMembership || !['OWNER', 'ADMIN'].includes(adminMembership.role)) {
            return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }

        // Get target member
        const targetMember = await prisma.jarMember.findUnique({
            where: { userId_jarId: { userId: targetUserId, jarId } }
        });

        if (!targetMember) {
            return NextResponse.json({ error: "Member not found" }, { status: 404 });
        }

        // Prevent modifying OWNER role
        if (targetMember.role === 'OWNER' && role !== 'OWNER') {
            return NextResponse.json({
                error: "Cannot demote the jar owner. Transfer ownership first."
            }, { status: 403 });
        }

        // Only OWNER can set someone to OWNER
        if (role === 'OWNER' && adminMembership.role !== 'OWNER') {
            return NextResponse.json({
                error: "Only the jar owner can transfer ownership."
            }, { status: 403 });
        }

        // If demoting from ADMIN or OWNER to a lower role, check admin count
        if (['OWNER', 'ADMIN'].includes(targetMember.role) && !['OWNER', 'ADMIN'].includes(role)) {
            const adminCount = await prisma.jarMember.count({
                where: {
                    jarId,
                    role: { in: ['OWNER', 'ADMIN'] }
                }
            });

            if (adminCount <= 1) {
                return NextResponse.json({
                    error: "Cannot demote the last administrator. Promote someone else first."
                }, { status: 403 });
            }
        }

        // Update the role
        await prisma.jarMember.update({
            where: { userId_jarId: { userId: targetUserId, jarId } },
            data: { role: role as any }
        });

        return NextResponse.json({ success: true, role });

    } catch (error) {
        console.error("Update member role error", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string, userId: string }> }
) {
    try {
        const { id: jarId, userId: targetUserId } = await params;
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { status, role } = body;

        if (status && !['ACTIVE', 'REJECTED'].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }
        if (role && !['ADMIN', 'MEMBER'].includes(role)) {
            return NextResponse.json({ error: "Invalid role" }, { status: 400 });
        }

        // Verify Admin Access
        const adminMembership = await prisma.jarMember.findUnique({
            where: {
                userId_jarId: { userId: session.user.id, jarId }
            }
        });

        if (!adminMembership || !['OWNER', 'ADMIN'].includes(adminMembership.role)) {
            return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }

        if (status === 'REJECTED') {
            await prisma.jarMember.delete({
                where: { userId_jarId: { userId: targetUserId, jarId } }
            });

            return NextResponse.json({ success: true, status: 'REJECTED' });
        }

        // Handle Updates
        const member = await prisma.jarMember.findUnique({
            where: { userId_jarId: { userId: targetUserId, jarId } },
            include: { user: true, jar: true }
        });

        if (!member) {
            return NextResponse.json({ error: "Member not found" }, { status: 404 });
        }

        const dataToUpdate: any = {};

        // Check limits if moving to Active
        if (status === 'ACTIVE' && member.status !== 'ACTIVE') {
            dataToUpdate.status = 'ACTIVE';
        }

        if (role) {
            dataToUpdate.role = role;
        }

        await prisma.jarMember.update({
            where: { userId_jarId: { userId: targetUserId, jarId } },
            data: dataToUpdate
        });

        // Send Email Notification
        if (member.user.email) {
            await sendEmail({
                to: member.user.email,
                subject: `You've been accepted to ${member.jar.name}!`,
                html: `
                    <h1>Welcome to the Community!</h1>
                    <p>Your request to join <strong>${member.jar.name}</strong> has been approved.</p>
                    <p>You can now view the jar, suggest ideas, and participate in votes.</p>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display:inline-block;padding:12px 24px;background:#7c3aed;color:white;text-decoration:none;border-radius:8px;">Go to Dashboard</a>
                `
            });
        }

        return NextResponse.json({ success: true, status: 'ACTIVE' });

    } catch (error) {
        console.error("Update member error", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

