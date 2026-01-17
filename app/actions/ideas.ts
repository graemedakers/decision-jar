'use server';

import { ActionResponse, Idea } from '@/lib/types';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { awardXp, updateStreak } from '@/lib/gamification';
import { checkAndUnlockAchievements } from '@/lib/achievements';
import { getBestCategoryFit } from '@/lib/categories';
import { notifyJarMembers } from '@/lib/notifications';
import { revalidatePath } from 'next/cache';

export async function createIdea(data: any): Promise<ActionResponse<{ idea: Idea }>> {
    const session = await getSession();
    if (!session?.user?.id) {
        return { success: false, error: 'Unauthorized', status: 401 };
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { memberships: true }
    });

    if (!user) {
        return { success: false, error: 'User not found', status: 404 };
    }

    // Priority: 1. activeJarId, 2. First membership
    const currentJarId = user.activeJarId ||
        (user.memberships?.[0]?.jarId);

    if (!currentJarId) {
        return { success: false, error: 'No active jar', status: 400 };
    }

    const jar = await prisma.jar.findUnique({ where: { id: currentJarId } });
    if (!jar) {
        return { success: false, error: 'Jar not found', status: 404 };
    }

    // Check if Voting is Active
    const activeVote = await prisma.voteSession.findFirst({
        where: { jarId: currentJarId, status: 'ACTIVE' }
    });

    if (activeVote) {
        return { success: false, error: "Cannot add new ideas while a vote is in progress.", status: 403 };
    }

    try {
        const { description, indoor, duration, activityLevel, cost, timeOfDay, details, category, selectedAt, notes, address, website, googleRating, openingHours, rating, photoUrls, selectedDate, isPrivate, weather, requiresTravel } = data;

        if (!description) {
            return { success: false, error: 'Description is required', status: 400 };
        }

        const requestedCategory = category || 'ACTIVITY';
        const finalCategory = getBestCategoryFit(requestedCategory, jar.topic, (jar as any).customCategories as any[]);

        // Community logic
        const membership = await prisma.jarMember.findUnique({
            where: {
                userId_jarId: { userId: session.user.id, jarId: currentJarId }
            }
        });
        const isAdmin = membership?.role === 'ADMIN';
        const ideaStatus = (jar.isCommunityJar && !isAdmin) ? 'PENDING' : 'APPROVED';

        const safeDuration = typeof duration === 'string' ? parseFloat(duration) : Number(duration);

        const createData: Prisma.IdeaUncheckedCreateInput = {
            description,
            details: details || null,
            indoor: Boolean(indoor),
            duration: isNaN(safeDuration) ? 2.0 : safeDuration,
            activityLevel,
            cost,
            timeOfDay: timeOfDay || 'ANY',
            category: finalCategory,
            selectedAt: selectedAt ? new Date(selectedAt) : null,
            selectedDate: selectedDate ? new Date(selectedDate) : (selectedAt ? new Date(selectedAt) : null),
            jarId: currentJarId,
            createdById: session.user.id,
            notes: notes || null,
            address: address || null,
            website: website || null,
            googleRating: googleRating ? parseFloat(String(googleRating)) : null,
            openingHours: openingHours || null,
            rating: rating ? parseInt(String(rating)) : null,
            photoUrls: photoUrls || [],
            isPrivate: Boolean(isPrivate),
            weather: weather || 'ANY',
            requiresTravel: Boolean(requiresTravel),
            status: ideaStatus as any,
        };

        const idea = await prisma.idea.create({
            data: createData,
        });

        // Gamification
        try {
            await updateStreak(currentJarId);
            await awardXp(currentJarId, 15);
            await checkAndUnlockAchievements(currentJarId);
        } catch (xpError) {
            console.error("Gamification error:", xpError);
        }

        // Send push notification to other jar members (non-blocking)
        notifyJarMembers(currentJarId, session.user.id, {
            title: `💡 ${session.user.name || 'Someone'} added a new idea`,
            body: description.length > 60 ? description.substring(0, 57) + '...' : description,
            url: '/jar',
            icon: '/icon-192.png'
        }).catch(err => console.error("Notification error:", err));

        revalidatePath('/dashboard');
        revalidatePath('/jar');

        return { success: true, idea: idea as any };
    } catch (error: any) {
        console.error('Error creating idea:', error);
        return { success: false, error: error.message || 'Unknown error', status: 500 };
    }
}

export async function updateIdea(id: string, data: any): Promise<ActionResponse<{ idea: Idea }>> {
    const session = await getSession();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized', status: 401 };

    const idea = await prisma.idea.findUnique({ where: { id } });
    if (!idea) return { success: false, error: 'Idea not found', status: 404 };

    // Check permissions (Owner or Admin)
    const membership = await prisma.jarMember.findUnique({
        where: { userId_jarId: { userId: session.user.id, jarId: idea.jarId! } }
    });
    const isAdmin = membership?.role === 'ADMIN';
    if (idea.createdById !== session.user.id && !isAdmin) {
        return { success: false, error: 'Forbidden', status: 403 };
    }

    try {
        const { description, indoor, duration, activityLevel, cost, timeOfDay, details, category, isPrivate, weather, requiresTravel } = data;
        const safeDuration = typeof duration === 'string' ? parseFloat(duration) : Number(duration);

        const updated = await prisma.idea.update({
            where: { id },
            data: {
                description,
                details: details || null,
                indoor: Boolean(indoor),
                duration: isNaN(safeDuration) ? 2.0 : safeDuration,
                activityLevel,
                cost,
                timeOfDay,
                category,
                isPrivate: Boolean(isPrivate),
                weather,
                requiresTravel: Boolean(requiresTravel)
            }
        });

        revalidatePath('/dashboard');
        revalidatePath('/jar');
        return { success: true, idea: updated as any };
    } catch (e: any) {
        return { success: false, error: e.message || 'Error updating', status: 500 };
    }
}

export async function deleteIdea(id: string): Promise<ActionResponse> {
    const session = await getSession();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized', status: 401 };

    const idea = await prisma.idea.findUnique({ where: { id } });
    if (!idea) return { success: false, error: 'Idea not found', status: 404 };

    // Permissions
    const membership = await prisma.jarMember.findUnique({
        where: { userId_jarId: { userId: session.user.id, jarId: idea.jarId! } }
    });
    const isAdmin = membership?.role === 'ADMIN';
    if (idea.createdById !== session.user.id && !isAdmin) {
        return { success: false, error: 'Forbidden', status: 403 };
    }

    try {
        await prisma.idea.delete({ where: { id } });
        revalidatePath('/dashboard');
        revalidatePath('/jar');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message || 'Error deleting', status: 500 };
    }
}
