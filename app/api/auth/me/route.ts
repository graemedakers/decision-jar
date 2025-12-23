import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { isCouplePremium, isUserPro } from '@/lib/premium';

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await getSession();
    if (!session?.user?.email) {
        return NextResponse.json({ user: null });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                // Fetch the active jar details
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
                },
                // Legacy fallback support
                couple: {
                    include: {
                        members: {
                            include: { user: { select: { id: true } } }
                        },
                        achievements: true
                    }
                }
            },
        });

        // Determine the Active Jar
        // Priority: 1. activeJarId, 2. First Membership, 3. Legacy Couple
        let activeJar = null;
        let isCreator = false;
        let hasPartner = false;

        if (user) {
            if (user.activeJarId) {
                const membership = user.memberships.find(m => m.jarId === user.activeJarId);
                activeJar = membership?.jar;
            } else if (user.memberships.length > 0) {
                // Fallback to first jar
                activeJar = user.memberships[0].jar;
            } else if (user.couple) {
                // Legacy Fallback
                activeJar = user.couple;
            }
        }

        // Calculate user-level premium status FIRST (independent of jar)
        const userIsPro = isUserPro(user);

        if (!user || !activeJar) {
            // If user exists but has no jar, return user only (onboarding state)  
            if (user) {
                return NextResponse.json({
                    user: {
                        ...user,
                        isCreator: false,
                        hasPartner: false,
                        isPremium: userIsPro, // User can have premium even without a jar
                        hasPaid: userIsPro,
                        location: null, // No jar means no location
                        coupleReferenceCode: null,
                        isTrialEligible: true,
                        coupleCreatedAt: user.createdAt,
                    }
                });
            }
            return NextResponse.json({ user: null });
        }

        const members = activeJar.members || (activeJar as any).users || []; // Handle legacy vs new structure if mixed
        // Find if user is creator (for now, assume first member or check ownerId if we added it, but schema didn't have ownerId yet on Jar, just implied)
        // Actually, let's say "isCreator" if they are ADMIN role
        const userMemberFunc = user.memberships.find(m => m.jarId === activeJar?.id);
        isCreator = userMemberFunc?.role === 'ADMIN';

        // For simple couple logic, hasPartner means > 1 member
        hasPartner = members.length > 1;

        // Check jar-level premium and combine with user premium
        const jarIsPremium = isCouplePremium(activeJar);
        const effectivePremium = jarIsPremium || userIsPro;

        // Return user with mapped jar data
        return NextResponse.json({
            user: {
                ...user,
                // Map Jar fields to legacy Couple fields for frontend compatibility
                coupleReferenceCode: activeJar.referenceCode,
                location: activeJar.location,
                isPremium: effectivePremium,
                hasPaid: effectivePremium,
                isTrialEligible: activeJar.isTrialEligible,
                coupleCreatedAt: activeJar.createdAt,
                xp: activeJar.xp || 0,
                level: activeJar.level || 1,
                unlockedAchievements: activeJar.achievements?.map((a: any) => a.achievementId) || [],

                // Helper flags
                activeJarId: activeJar.id,
                jarName: activeJar.name,
                jarType: activeJar.type,
                isCreator,
                hasPartner
            }
        });
    } catch (error) {
        console.error("Error fetching user in /api/auth/me:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
