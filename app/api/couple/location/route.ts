import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
    const session = await getSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id }
    });

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentJarId = user.activeJarId || user.coupleId;

    if (!currentJarId) {
        return NextResponse.json({ error: 'No active jar' }, { status: 400 });
    }

    try {
        const { location } = await request.json();

        // Use prisma.jar instead of prisma.couple (which no longer exists on client)
        await prisma.jar.update({
            where: { id: currentJarId },
            data: { location },
        });

        return NextResponse.json({ success: true, location });
    } catch (error: any) {
        console.error('Error updating location:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message
        }, { status: 500 });
    }
}
