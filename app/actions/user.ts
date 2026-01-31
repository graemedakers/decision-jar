'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { User, Jar } from '@prisma/client';
import { getEffectivePremiumStatus, hasActuallyPaid as checkHasActuallyPaid } from '@/lib/premium-utils';

export type ActionResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
    status?: number;
};

export type UpdateUserSettingsInput = {
    interests?: string;
    location?: string; // mapped to homeTown
    notifyStreakReminder?: boolean;
    notifyAchievements?: boolean;
    notifyLevelUp?: boolean;
    notifyIdeaAdded?: boolean;
    notifyJarSpun?: boolean;
    notifyVoting?: boolean;
    unitSystem?: string;
};

export async function updateUserSettings(data: UpdateUserSettingsInput): Promise<ActionResponse<User>> {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized", status: 401 };
        }

        const dataToUpdate: any = {};

        // Map fields
        if (data.interests !== undefined) dataToUpdate.interests = data.interests;
        if (data.location !== undefined) dataToUpdate.homeTown = data.location;
        if (data.unitSystem !== undefined) dataToUpdate.unitSystem = data.unitSystem;

        // Notifications
        if (data.notifyStreakReminder !== undefined) dataToUpdate.notifyStreakReminder = data.notifyStreakReminder;
        if (data.notifyAchievements !== undefined) dataToUpdate.notifyAchievements = data.notifyAchievements;
        if (data.notifyLevelUp !== undefined) dataToUpdate.notifyLevelUp = data.notifyLevelUp;
        if (data.notifyIdeaAdded !== undefined) dataToUpdate.notifyIdeaAdded = data.notifyIdeaAdded;
        if (data.notifyJarSpun !== undefined) dataToUpdate.notifyJarSpun = data.notifyJarSpun;
        if (data.notifyVoting !== undefined) dataToUpdate.notifyVoting = data.notifyVoting;

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: dataToUpdate,
        });

        revalidatePath('/dashboard');
        revalidatePath('/profile');

        return { success: true, data: updatedUser };

    } catch (error: any) {
        console.error("[UPDATE_USER_SETTINGS]", error);
        return { success: false, error: error.message || "Internal Server Error", status: 500 };
    }
}

export async function getUserDetails(): Promise<ActionResponse<{ user: any }>> {
    const session = await getSession();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized", status: 401 };
    }

    try {
        const user = await prisma.user.findFirst({
            where: { email: { equals: session.user.email, mode: 'insensitive' } },
            include: {
                // Fetch the active jar details with its related members and achievements
                memberships: {
                    include: {
                        jar: {
                            include: {
                                members: {
                                    include: { user: { select: { id: true, name: true } } }
                                },
                                achievements: true
                            }
                        }
                    }
                }
            },
        });

        // Determine the Active Jar
        // Priority: 1. activeJarId, 2. First Membership
        let activeJar: (Jar & { members: any[], achievements: any[] }) | null = null;
        let isCreator = false;
        let hasPartner = false;

        if (user) {
            // Validate activeJarId points to jar user has access to
            if (user.activeJarId) {
                const membership = user.memberships.find(m => m.jarId === user.activeJarId);

                if (membership) {
                    // User has valid membership in active jar
                    activeJar = membership.jar as any;
                } else {
                    // Auto-correct: activeJarId points to jar user doesn't have access to
                    const firstAvailableJar = user.memberships[0]?.jar || null;
                    const newActiveJarId = firstAvailableJar?.id || null;

                    await prisma.user.update({
                        where: { id: user.id },
                        data: { activeJarId: newActiveJarId }
                    });

                    activeJar = firstAvailableJar as any;
                }
            } else if (user.memberships.length > 0) {
                // Fallback to first jar
                activeJar = user.memberships[0].jar as any;
                await prisma.user.update({
                    where: { id: user.id },
                    data: { activeJarId: activeJar!.id }
                });
            }
        }

        if (!user) {
            console.warn(`Session exists for deleted user: ${session.user.email}`);
            return { success: false, error: 'User account not found', status: 401 };
        }

        if (!activeJar) {
            const effectivePremium = getEffectivePremiumStatus(user);
            const hasPaid = checkHasActuallyPaid(user);

            return {
                success: true,
                data: {
                    user: {
                        ...user,
                        isSuperAdmin: user.isSuperAdmin,
                        isCreator: false,
                        hasPartner: false,
                        isPremium: effectivePremium,
                        hasPaid: hasPaid,
                        location: user.homeTown,
                        coupleReferenceCode: null,
                        isTrialEligible: true,
                        coupleCreatedAt: user.createdAt,
                    }
                }
            };
        }

        const members = activeJar.members || [];
        const userMemberFunc = user.memberships.find(m => m.jarId === activeJar?.id);
        isCreator = ['OWNER', 'ADMIN'].includes(userMemberFunc?.role as any);
        hasPartner = members.length > 1;

        const effectivePremium = getEffectivePremiumStatus(user, activeJar);
        const hasPaid = checkHasActuallyPaid(user, activeJar);

        // Return user with mapped jar data
        const mappedUser = {
            ...user,
            isSuperAdmin: user.isSuperAdmin,
            // Map Jar fields to legacy Couple fields for frontend compatibility
            coupleReferenceCode: activeJar.referenceCode,
            referenceCode: activeJar.referenceCode,
            location: user.homeTown,
            isPremium: effectivePremium,
            hasPaid: hasPaid,
            isTrialEligible: activeJar.isTrialEligible,
            coupleCreatedAt: (user.createdAt > activeJar.createdAt) ? user.createdAt : activeJar.createdAt,
            xp: activeJar.xp || 0,
            level: activeJar.level || 1,
            unlockedAchievements: activeJar.achievements?.map((a: any) => a.achievementId) || [],
            currentStreak: (activeJar as any).currentStreak || 0,
            longestStreak: (activeJar as any).longestStreak || 0,
            lastActiveDate: (activeJar as any).lastActiveDate || null,

            // Helper flags
            activeJarId: activeJar.id,
            jarName: activeJar.name,
            jarType: activeJar.type,
            jarTopic: activeJar.topic,
            jarSelectionMode: (activeJar as any).selectionMode,
            defaultIdeaPrivate: (activeJar as any).defaultIdeaPrivate,
            customCategories: (activeJar as any).customCategories,
            jarVoteCandidatesCount: (activeJar as any).voteCandidatesCount || 0,
            memberCount: members.length,
            isCreator,
            hasPartner,
            premiumInviteToken: user.premiumInviteToken,
        };

        return { success: true, data: { user: mappedUser } };

    } catch (error: any) {
        console.error("[GET_USER_DETAILS]", error);
        return { success: false, error: error.message || "Internal Server Error", status: 500 };
    }
}
