import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { NextResponse } from 'next/server';
import { checkAndPromoteWaitlist } from '@/lib/community';

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

        if (!adminMembership || adminMembership.role !== 'ADMIN') {
            return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }

        if (status === 'REJECTED') {
            await prisma.jarMember.delete({
                where: { userId_jarId: { userId: targetUserId, jarId } }
            });

            // Trigger Waitlist Promotion
            await checkAndPromoteWaitlist(jarId);

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
            const currentCount = await prisma.jarMember.count({
                where: { jarId, status: 'ACTIVE' }
            });

            if (member.jar.memberLimit && currentCount >= member.jar.memberLimit) {
                return NextResponse.json({ error: "Member limit reached. Increase limit or remove members." }, { status: 400 });
            }
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
