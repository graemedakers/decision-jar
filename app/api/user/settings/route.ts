import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const PUT = withAuth(async (request, { user }) => {
    try {
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
        const data: Prisma.UserUpdateInput = {};
        if (interests !== undefined) data.interests = interests;
        if (location !== undefined) data.homeTown = location;
        if (notifyStreakReminder !== undefined) data.notifyStreakReminder = notifyStreakReminder;
        if (notifyAchievements !== undefined) data.notifyAchievements = notifyAchievements;
        if (notifyLevelUp !== undefined) data.notifyLevelUp = notifyLevelUp;
        if (notifyIdeaAdded !== undefined) data.notifyIdeaAdded = notifyIdeaAdded;
        if (notifyJarSpun !== undefined) data.notifyJarSpun = notifyJarSpun;
        if (notifyVoting !== undefined) data.notifyVoting = notifyVoting;

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data,
        });

        return NextResponse.json({ user: updatedUser });

    } catch (error: unknown) {
        console.error('Update user settings error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: 'Internal Server Error', details: message }, { status: 500 });
    }
});

export const PATCH = withAuth(async (request, { user }) => {
    try {
        const body = await request.json();
        const dataToUpdate: Prisma.UserUpdateInput = {};

        // Handle inconsistent naming
        if (body.interests !== undefined) dataToUpdate.interests = body.interests;
        if (body.location !== undefined) dataToUpdate.homeTown = body.location;
        if (body.homeTown !== undefined) dataToUpdate.homeTown = body.homeTown;


        if (Object.keys(dataToUpdate).length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: dataToUpdate,
        });

        return NextResponse.json({ user: updatedUser });

    } catch (error: unknown) {
        console.error('Patch user settings error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: 'Internal Server Error', details: message }, { status: 500 });
    }
});
