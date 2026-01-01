import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { name } = await request.json();

    if (!name || name.trim().length === 0) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    try {
        // Check if user is an ADMIN of this jar
        const membership = await prisma.jarMember.findUnique({
            where: {
                userId_jarId: {
                    userId: session.user.id,
                    jarId: id
                }
            }
        });

        if (!membership || membership.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Only admins can rename jars' }, { status: 403 });
        }

        const updatedJar = await prisma.jar.update({
            where: { id },
            data: { name: name.trim() }
        });

        return NextResponse.json(updatedJar);
    } catch (error) {
        console.error('Failed to update jar name:', error);
        return NextResponse.json({ error: 'Failed to update jar name' }, { status: 500 });
    }
}
