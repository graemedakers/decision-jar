import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            interests,
            location,
            notifyStreakReminder,
            notifyAchievements,
            notifyLevelUp,
            notifyIdeaAdded,
            notifyJarSpun,
            notifyVoting
        } = body;

        // Build update object, filtering out undefined
        const data: any = {};
        if (interests !== undefined) data.interests = interests;
        if (location !== undefined) data.homeTown = location;
        if (notifyStreakReminder !== undefined) data.notifyStreakReminder = notifyStreakReminder;
        if (notifyAchievements !== undefined) data.notifyAchievements = notifyAchievements;
        if (notifyLevelUp !== undefined) data.notifyLevelUp = notifyLevelUp;
        if (notifyIdeaAdded !== undefined) data.notifyIdeaAdded = notifyIdeaAdded;
        if (notifyJarSpun !== undefined) data.notifyJarSpun = notifyJarSpun;
        if (notifyVoting !== undefined) data.notifyVoting = notifyVoting;

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data,
        });

        return NextResponse.json({ user: updatedUser });

    } catch (error: any) {
        console.error('Update user settings error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const dataToUpdate: any = {};

        // Handle inconsistent naming
        if (body.interests !== undefined) dataToUpdate.interests = body.interests;
        if (body.location !== undefined) dataToUpdate.homeTown = body.location;
        if (body.homeTown !== undefined) dataToUpdate.homeTown = body.homeTown;
        if (body.unitSystem !== undefined) dataToUpdate.unitSystem = body.unitSystem;

        if (Object.keys(dataToUpdate).length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: dataToUpdate,
        });

        return NextResponse.json({ user: updatedUser });

    } catch (error: any) {
        console.error('Patch user settings error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
