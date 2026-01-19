import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify Super Admin
        const user = await prisma.user.findUnique({ where: { id: session.user.id } });
        if (!user?.isSuperAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = await context.params;
        const { isActive } = await request.json();

        const token = await prisma.premiumInviteToken.update({
            where: { id },
            data: { isActive }
        });

        return NextResponse.json(token);
    } catch (error) {
        console.error('Failed to update token', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify Super Admin
        const user = await prisma.user.findUnique({ where: { id: session.user.id } });
        if (!user?.isSuperAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = await context.params;

        // Soft delete: Deactivate
        await prisma.premiumInviteToken.update({
            where: { id },
            data: { isActive: false }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete token', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
