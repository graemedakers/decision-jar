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
import { ideaSchema } from '@/lib/validations/idea';

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
        // ✅ Use Zod to validate and extract fields
        const validatedData = ideaSchema.parse(data);
        const { duration, category, selectedAt, selectedDate, ...restData } = validatedData;

        const finalCategory = getBestCategoryFit(category || 'ACTIVITY', jar.topic, (jar as any).customCategories as any[]);

        const createData: Prisma.IdeaUncheckedCreateInput = {
            ...restData,
            duration: duration || 2.0,
            category: finalCategory,
            selectedAt: selectedAt ? new Date(selectedAt) : null,
            selectedDate: selectedDate ? new Date(selectedDate) : (selectedAt ? new Date(selectedAt) : null),
            jarId: currentJarId,
            createdById: session.user.id,
            status: 'APPROVED',
            schemaVersion: (data as any).schemaVersion || "1.0",
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
        // Hide details if idea is private or a surprise
        const isSecretIdea = Boolean(restData.isPrivate) || Boolean(data.isSurprise);
        notifyJarMembers(currentJarId, session.user.id, {
            title: `💡 ${session.user.name || 'Someone'} added a new idea`,
            body: isSecretIdea ? '🤫 It\'s a secret... spin to find out!' : (restData.description.length > 60 ? restData.description.substring(0, 57) + '...' : restData.description),
            url: '/jar',
            icon: '/icon-192.png'
        }, 'notifyIdeaAdded').catch(err => console.error("Notification error:", err));

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
    const isAdmin = membership?.role === 'ADMIN' || membership?.role === 'OWNER';
    if (idea.createdById !== session.user.id && !isAdmin) {
        return { success: false, error: 'Forbidden', status: 403 };
    }

    try {
        // ✅ Use Zod to validate and extract fields (prevent silent dropping)
        const validatedData = ideaSchema.partial().parse(data);
        const { duration, ...restData } = validatedData;

        const updated = await prisma.idea.update({
            where: { id },
            data: {
                ...restData,
                duration: duration !== undefined ? duration : undefined,
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
    const isAdmin = membership?.role === 'ADMIN' || membership?.role === 'OWNER';
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

export async function duplicateIdea(id: string, targetJarId?: string): Promise<ActionResponse<{ idea: Idea }>> {
    const session = await getSession();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized', status: 401 };

    try {
        const sourceIdea = await prisma.idea.findUnique({ where: { id } });
        if (!sourceIdea) return { success: false, error: 'Source idea not found', status: 404 };

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { memberships: true }
        });

        if (!user) return { success: false, error: 'User not found', status: 404 };

        // Determine target jar: Provided ID -> Source Jar (if member) -> Active Jar -> First available
        let finalTargetJarId = targetJarId;

        if (!finalTargetJarId) {
            // Check if user is member of source jar
            const sourceJarMembership = user.memberships.find(m => m.jarId === sourceIdea.jarId);
            if (sourceJarMembership) {
                finalTargetJarId = sourceIdea.jarId;
            } else {
                finalTargetJarId = user.activeJarId || user.memberships[0]?.jarId;
            }
        }

        if (!finalTargetJarId) return { success: false, error: 'No target jar found', status: 400 };

        // Verify membership and permissions in target jar
        const targetMembership = user.memberships.find(m => m.jarId === finalTargetJarId);
        if (!targetMembership) return { success: false, error: 'Not a member of target jar', status: 403 };

        const isAuthorized = targetMembership.role === 'ADMIN' || targetMembership.role === 'OWNER' || user.isSuperAdmin;
        if (!isAuthorized) {
            return { success: false, error: 'Only admins or owners can add ideas to this jar', status: 403 };
        }

        // Clone the data, resetting completion fields
        const { id: _, createdAt: __, updatedAt: ___, selectedAt: ____, selectedDate: _____, rating: ______, notes: _______, createdById: ________, jarId: _________, ...cloneData } = sourceIdea;

        const duplicated = await prisma.idea.create({
            data: {
                ...cloneData,
                jarId: finalTargetJarId,
                createdById: session.user.id,
                status: 'APPROVED', // Ensure it's approved in the target jar
                selectedAt: null,
                selectedDate: null,
                rating: null,
                notes: null,
                isSurprise: false, // Reset surprise status for new copy
                typeData: cloneData.typeData ?? undefined,
                metadata: cloneData.metadata ?? undefined,
            }
        });

        // Gamification for adding (similar to createIdea)
        try {
            await awardXp(finalTargetJarId, 10); // Slightly less XP for duplication
        } catch (e) { console.error("Duplication XP error:", e); }

        revalidatePath('/dashboard');
        revalidatePath('/jar');
        revalidatePath('/memories');

        return { success: true, idea: duplicated as any };
    } catch (e: any) {
        console.error('Error duplicating idea:', e);
        return { success: false, error: e.message || 'Error duplicating', status: 500 };
    }
}
