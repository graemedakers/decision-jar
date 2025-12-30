import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
    const session = await getSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, topic, type, selectionMode } = await request.json();

    const user = await prisma.user.findUnique({
        where: { id: session.user.id }
    });

    if (!user || !user.activeJarId) {
        return NextResponse.json({ error: 'No active jar' }, { status: 404 });
    }

    // Check if user is an ADMIN of this jar
    const membership = await prisma.jarMember.findFirst({
        where: { jarId: user.activeJarId, userId: user.id }
    });

    if (membership?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Only admins can change jar settings' }, { status: 403 });
    }

    try {
        const updatedJar = await prisma.jar.update({
            where: { id: user.activeJarId },
            data: {
                name,
                topic,
                type,
            }
        });

        return NextResponse.json(updatedJar);
    } catch (error) {
        console.error('Failed to update jar settings:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
