import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request) {
    try {
        const session = await getSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { interests, location } = await request.json();

        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: {
                interests,
                homeTown: location, // Save location to homeTown field
            },
        });

        return NextResponse.json({ user: updatedUser });

    } catch (error: any) {
        console.error('Update user settings error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
