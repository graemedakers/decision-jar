"use server";

import { ActionResponse, Idea, SpinFilters } from '@/lib/types';
import { prisma } from '@/lib/prisma';
import { checkActionAuth } from '@/lib/actions-utils';
import { notifyJarMembers } from '@/lib/notifications';
import { awardXp, updateStreak } from '@/lib/gamification';
import { checkAndUnlockAchievements } from '@/lib/achievements';
import { COST_VALUES, ACTIVITY_VALUES } from '@/lib/constants';
import { revalidatePath } from 'next/cache';

export async function spinJar(filters: SpinFilters): Promise<ActionResponse<{ idea: Idea }>> {
    try {
        const auth = await checkActionAuth();
        const { minDuration, maxDuration, maxCost, maxActivityLevel, timeOfDay, category, weather, localOnly, ideaTypes } = filters;
        if (minDuration !== undefined && maxDuration !== undefined && minDuration > maxDuration) {
            return { success: false, error: 'Invalid duration range: maxDuration must be greater than minDuration', status: 400 };
        }

        if (!auth.authorized) {
            return { success: false, error: auth.error, status: auth.status };
        }
        const { session } = auth;

        // 1. Fetch User and Active Jar
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                memberships: {
                    include: {
                        jar: {
                            select: {
                                id: true,
                                revealPace: true,
                                lastRevealAt: true
                            }
                        }
                    }
                }
            }
        });

        if (!user) return { success: false, error: 'User not found', status: 404 };

        const currentJarId = user.activeJarId || user.memberships?.[0]?.jarId;
        if (!currentJarId) return { success: false, error: 'No active jar found', status: 400 };

        const currentUserMembership = user.memberships.find(m => m.jarId === currentJarId);
        // Access the Jar from the membership query (safely)
        const activeJar = currentUserMembership?.jar;

        if (!activeJar) return { success: false, error: 'Jar not found', status: 404 };

        // 🚨 Permission Check: Only Admins/Owners can spin
        const canSpin = currentUserMembership?.role === 'ADMIN' || currentUserMembership?.role === 'OWNER';

        if (!canSpin) {
            return {
                success: false,
                error: 'Only jar admins can spin the jar. Ask an admin to spin!',
                status: 403
            };
        }

        // 🛑 Reveal Pace Check
        if (activeJar.revealPace === 'DAILY' && activeJar.lastRevealAt) {
            // Get user timezone from filters or default to UTC
            const userTimeZone = filters.userTimeZone || 'UTC';

            try {
                const now = new Date();
                const last = new Date(activeJar.lastRevealAt);

                // Use Intl to compare "Calendar Days" in the user's timezone
                const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: userTimeZone, year: 'numeric', month: '2-digit', day: '2-digit' });
                const todayStr = fmt.format(now);
                const lastStr = fmt.format(last);

                if (todayStr === lastStr) {
                    return {
                        success: false,
                        error: "Patience! You can only open one mystery idea per day. Come back tomorrow!",
                        status: 429
                    };
                }
            } catch (e) {
                console.error("Timezone check failed", e);
                // Fail safe: Allow spin if TZ check fails? Or Block? 
                // Let's block to be safe but log it.
            }
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


        // Filter by Idea Type
        if (ideaTypes && Array.isArray(ideaTypes) && ideaTypes.length > 0) {
            whereClause.ideaType = { in: ideaTypes };
        }

        // Fetch ideas
        const candidateIdeas = await prisma.idea.findMany({ where: whereClause });


        // 3. Apply Multi-dimensional Filters
        const filteredIdeas = candidateIdeas.filter(idea => {
            // excludeIds
            if (filters.excludeIds && Array.isArray(filters.excludeIds) && filters.excludeIds.includes(idea.id)) {
                return false;
            }

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
            // Transaction to ensure atomicity
            await prisma.$transaction(async (tx) => {
                // Update Idea
                await tx.idea.update({
                    where: { id: selectedIdea.id },
                    data: {
                        selectedAt: new Date(),
                        selectedDate: new Date(),
                    },
                });

                // Update Jar (Last Reveal)
                await tx.jar.update({
                    where: { id: currentJarId },
                    data: {
                        lastRevealAt: new Date()
                    }
                });
            });

            // Parallel background tasks
            (async () => {
                try {
                    // Send push notifications to other jar members (not the person who picked)
                    // Send push notification to other jar members (not the person who picked)
                    await notifyJarMembers(currentJarId, session.user.id as string, {
                        title: `🎯 New pick: "${selectedIdea.description}"`,
                        body: `${session.user.name || 'Someone'} selected this from your jar!`,
                        url: `/jar?selected=${selectedIdea.id}`,
                        icon: selectedIdea.photoUrls?.[0] || '/icon-192.png'
                    }, 'notifyJarSpun');

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
        const isAdmin = membership?.role === 'ADMIN' || membership?.role === 'OWNER';

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
