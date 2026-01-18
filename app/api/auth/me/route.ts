import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getEffectivePremiumStatus, hasActuallyPaid as checkHasActuallyPaid } from '@/lib/premium-utils';

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await getSession();
    if (!session?.user?.id) {
        return NextResponse.json({ user: null });
    }

    try {
        const user = await prisma.user.findFirst({
            where: { email: { equals: session.user.email, mode: 'insensitive' } },
            include: {
                // Fetch the active jar details with ALL fields
                // ✅ CRITICAL: This now includes isCommunityJar for personal vs community detection
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
        let activeJar = null;
        let isCreator = false;
        let hasPartner = false;

        if (user) {
            // ✅ CRITICAL FIX: Validate activeJarId points to jar user has access to
            if (user.activeJarId) {
                const membership = user.memberships.find(m => m.jarId === user.activeJarId);

                if (membership) {
                    // User has valid membership in active jar
                    activeJar = membership.jar;
                } else {
                    // ❌ activeJarId points to jar user doesn't have access to!
                    // This can happen if user was removed from jar
                    console.warn(`User ${user.id} has invalid activeJarId: ${user.activeJarId}`);

                    // Auto-correct: Set to first available jar or null
                    const firstAvailableJar = user.memberships[0]?.jar || null;
                    const newActiveJarId = firstAvailableJar?.id || null;

                    await prisma.user.update({
                        where: { id: user.id },
                        data: { activeJarId: newActiveJarId }
                    });

                    activeJar = firstAvailableJar;

                    // Log correction for debugging
                    console.log(`Corrected activeJarId for user ${user.id}: ${user.activeJarId} -> ${newActiveJarId}`);
                }
            } else if (user.memberships.length > 0) {
                // Fallback to first jar
                activeJar = user.memberships[0].jar;
                // Auto-persist the active jar choice for future consistency
                await prisma.user.update({
                    where: { id: user.id },
                    data: { activeJarId: activeJar.id }
                });
            }
        }

        if (!user || !activeJar) {
            // If user exists but has no jar, return user only (onboarding state)  
            if (user) {
                const effectivePremium = getEffectivePremiumStatus(user);
                const hasPaid = checkHasActuallyPaid(user);

                return NextResponse.json({
                    user: {
                        ...user,
                        isCreator: false,
                        hasPartner: false,
                        isPremium: effectivePremium,
                        hasPaid: hasPaid,
                        location: user.homeTown,
                        coupleReferenceCode: null,
                        isTrialEligible: true,
                        coupleCreatedAt: user.createdAt,
                    }
                });
            }

            // ❌ CRITICAL: User session exists but user is deleted from database
            // Return 401 to trigger nuke-session redirect and prevent infinite loop
            console.warn(`Session exists for deleted user: ${session.user.email}`);
            return NextResponse.json(
                { error: 'User account not found' },
                { status: 401 }
            );
        }

        const members = activeJar.members || (activeJar as any).users || [];
        const userMemberFunc = user.memberships.find(m => m.jarId === activeJar?.id);
        isCreator = ['OWNER', 'ADMIN'].includes(userMemberFunc?.role as any);
        hasPartner = members.length > 1;

        // Use unified premium status calculation
        const effectivePremium = getEffectivePremiumStatus(user, activeJar);
        const hasPaid = checkHasActuallyPaid(user, activeJar);

        // Return user with mapped jar data
        return NextResponse.json({
            user: {
                ...user,
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
                customCategories: (activeJar as any).customCategories,
                jarImageUrl: (activeJar as any).imageUrl || null,
                jarDescription: (activeJar as any).description || null,
                memberCount: members.length,
                isCreator,
                hasPartner,
                premiumInviteToken: user.premiumInviteToken,
            }
        });
    } catch (error) {
        console.error("Error fetching user in /api/auth/me:", error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : "Internal Server Error",
            stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
        }, { status: 500 });
    }
}
