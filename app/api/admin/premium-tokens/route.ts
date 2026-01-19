import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

export async function GET(request: Request) {
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

        const tokens = await prisma.premiumInviteToken.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                createdBy: { select: { name: true, email: true } },
                usedBy: { select: { name: true, email: true } }
            }
        });

        return NextResponse.json(tokens);
    } catch (error) {
        console.error('Failed to fetch tokens', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
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

        const body = await request.json();
        const { maxUses = 10, daysValid = 30, notes } = body;

        const token = await prisma.premiumInviteToken.create({
            data: {
                token: randomUUID(),
                createdById: session.user.id,
                expiresAt: new Date(Date.now() + Number(daysValid) * 24 * 60 * 60 * 1000),
                maxUses: Number(maxUses),
                isActive: true,
                notes
            }
        });

        return NextResponse.json(token);
    } catch (error) {
        console.error('Failed to create token', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
