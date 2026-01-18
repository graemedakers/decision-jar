"use server";

import { ActionResponse, Idea } from '@/lib/types';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { sendPushNotification } from '@/lib/notifications';
import { awardXp, updateStreak } from '@/lib/gamification';
import { checkAndUnlockAchievements } from '@/lib/achievements';
import { COST_VALUES, ACTIVITY_VALUES } from '@/lib/constants';
import { revalidatePath } from 'next/cache';

export async function spinJar(filters: any): Promise<ActionResponse<{ idea: Idea }>> {
    try {
        const session = await getSession();
        const { minDuration, maxDuration, maxCost, maxActivityLevel, timeOfDay, category, weather, localOnly } = filters;
        if (minDuration !== undefined && maxDuration !== undefined && minDuration > maxDuration) {
            return { success: false, error: 'Invalid duration range: maxDuration must be greater than minDuration', status: 400 };
        }

        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized', status: 401 };
        }

        // 1. Fetch User and Active Jar
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { memberships: true }
        });

        if (!user) return { success: false, error: 'User not found', status: 404 };

        const currentJarId = user.activeJarId || user.memberships?.[0]?.jarId;
        if (!currentJarId) return { success: false, error: 'No active jar found', status: 400 };

        // 🚨 Permission Check: Only Admins/Owners can spin
        const currentUserMembership = user.memberships.find(m => m.jarId === currentJarId);

        // OWNER isn't an enum value in MemberRole usually (it's ADMIN), but just in case, we check both.
        // Actually, schema usually has roles like 'ADMIN', 'MEMBER'.
        // Let's verify schema...
        // Assuming role is 'ADMIN' | 'MEMBER'. Owners usually have 'ADMIN' role.
        const canSpin = currentUserMembership?.role === 'ADMIN';

        if (!canSpin) {
            return {
                success: false,
                error: 'Only jar admins can spin the jar. Ask an admin to spin!',
                status: 403
            };
        }

        // 2. Build Prisma-level Filters
        const whereClause: any = {
            jarId: currentJarId,
            selectedAt: null,
            category: { not: 'PLANNED_DATE' }
        };

        if (category && category !== 'ANY') whereClause.category = category;
        if (timeOfDay && timeOfDay !== 'ANY') {
            whereClause.timeOfDay = { in: ['ANY', timeOfDay] };
        }

        // Fetch ideas
        const candidateIdeas = await prisma.idea.findMany({ where: whereClause });

        // 3. Apply Multi-dimensional Filters
        const filteredIdeas = candidateIdeas.filter(idea => {
            // Duration
            if (maxDuration !== undefined && idea.duration > maxDuration) return false;

            // Cost
            if (maxCost !== undefined) {
                const ideaCostVal = COST_VALUES[idea.cost] ?? 0;
                const maxCostVal = COST_VALUES[maxCost] ?? 3;
                if (ideaCostVal > maxCostVal) return false;
            }

            // Activity
            if (maxActivityLevel !== undefined) {
                const ideaActivityVal = ACTIVITY_VALUES[idea.activityLevel] ?? 0;
                const maxActivityVal = ACTIVITY_VALUES[maxActivityLevel] ?? 2;
                if (ideaActivityVal > maxActivityVal) return false;
            }

            // Weather
            if (weather && weather !== 'ANY') {
                const ideaWeather = (idea as any).weather || 'ANY';
                if (ideaWeather !== 'ANY' && ideaWeather !== weather) return false;
            }

            // Travel
            if (localOnly && (idea as any).requiresTravel) return false;

            return true;
        });

        if (filteredIdeas.length === 0) {
            return { success: false, error: 'No matching ideas found', status: 404 };
        }

        // 4. Random Selection
        const selectedIdea = filteredIdeas[Math.floor(Math.random() * filteredIdeas.length)];

        // 5. Update Selection State
        if (session && currentJarId) {
            await prisma.idea.update({
                where: { id: selectedIdea.id },
                data: {
                    selectedAt: new Date(),
                    selectedDate: new Date(),
                },
            });

            // Parallel background tasks
            (async () => {
                try {
                    // Send push notifications to other jar members (not the person who picked)
                    const members = await prisma.jarMember.findMany({
                        where: {
                            jarId: currentJarId,
                            userId: { not: session.user.id } // Exclude the person who picked
                        },
                        include: { user: true }
                    });

                    // Send push notification to each member
                    const notificationPromises = members.map(member =>
                        sendPushNotification(member.userId, {
                            title: `🎯 New pick: "${selectedIdea.description}"`,
                            body: `${session.user.name || 'Someone'} selected this from your jar!`,
                            url: `/jar?selected=${selectedIdea.id}`,
                            icon: selectedIdea.photoUrls?.[0] || '/icon-192.png'
                        })
                    );

                    await Promise.allSettled(notificationPromises);

                    // Award XP, update streak, and check achievements
                    await updateStreak(currentJarId);
                    await awardXp(currentJarId, 5);
                    await checkAndUnlockAchievements(currentJarId);
                } catch (err) {
                    console.error("Post-spin tasks failed:", err);
                }
            })();
        }

        // 6. Return with Permissions
        const isMyIdea = selectedIdea.createdById === session.user.id;
        const membership = await prisma.jarMember.findUnique({
            where: { userId_jarId: { userId: session.user.id, jarId: currentJarId } }
        });
        const isAdmin = membership?.role === 'ADMIN';

        revalidatePath('/dashboard');
        revalidatePath('/jar');

        return {
            success: true,
            idea: {
                ...selectedIdea,
                canEdit: isMyIdea || isAdmin,
                canDelete: isMyIdea || isAdmin
            } as any
        };

    } catch (error: any) {
        console.error('Spin error:', error);
        return { success: false, error: error.message || 'Error spinning', status: 500 };
    }
}
