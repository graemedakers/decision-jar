import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
    const session = await getSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Clear activeJarId
        await prisma.user.update({
            where: { id: user.id },
            data: { activeJarId: null }
        });

        return NextResponse.json({ success: true, message: 'Active jar cleared' });
    } catch (error) {
        console.error('Clear active jar error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
