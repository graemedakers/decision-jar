import { Jar, User } from "@prisma/client";

/**
 * Premium Status Determination (Simplified)
 * 
 * Premium features are unlocked if EITHER:
 * 1. User has isLifetimePro = true (user-level premium)
 * 2. User has active subscription (subscriptionStatus = 'active', 'trialing', or 'past_due')
 * 3. Jar has isPremium = true (jar-level premium, for manual overrides)
 * 4. User is within 14-day grace period
 * 
 * The effective premium status is: userIsPro OR jarIsPremium
 */

export function isUserPro(user: User | null | undefined): boolean {
    if (!user) return false;

    // 1. Lifetime Pro
    if (user.isLifetimePro) return true;

    // 2. Active Subscription or Stripe Trial
    const activeStatuses = ['active', 'trialing', 'past_due'];
    if (user.subscriptionStatus && activeStatuses.includes(user.subscriptionStatus)) {
        return true;
    }

    // 3. Automatic 14-Day Grace Period (No Card Required)
    const now = new Date();
    const created = new Date(user.createdAt);
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Check if within trial period (14 days)
    if (diffDays <= 14) {
        return true;
    }

    return false;
}

export function isCouplePremium(jar: Jar | null | undefined): boolean {
    if (!jar) return false;

    // 1. Manual/Legacy Premium Override
    if (jar.isPremium === true) return true;

    // 2. Automatic 14-Day Jar Trial (Only if trial eligible)
    if (jar.isTrialEligible !== false) {
        const now = new Date();
        const created = new Date(jar.createdAt);
        const diffTime = Math.abs(now.getTime() - created.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 14) {
            return true;
        }
    }

    return false;
}

/**
 * Checks if the user has ACTUALLY paid (excluding grace period/automated trials)
 * Used to determine if upsell banners should be shown.
 */
export function hasActuallyPaid(user: User | null | undefined): boolean {
    if (!user) return false;

    // 1. Lifetime Pro
    if (user.isLifetimePro) return true;

    // 2. Active Subscription or Stripe Trial
    const activeStatuses = ['active', 'trialing', 'past_due'];
    if (user.subscriptionStatus && activeStatuses.includes(user.subscriptionStatus)) {
        return true;
    }

    return false;
}

/**
 * Checks if the jar has ACTUALLY paid (excluding trial period)
 */
export function hasJarActuallyPaid(jar: Jar | null | undefined): boolean {
    if (!jar) return false;
    if (jar.isPremium === true) return true;
    return false;
}

export function getLimits(user: User | null | undefined) {
    const isPro = isUserPro(user);
    return {
        maxJars: isPro ? 50 : 3, // Increased from 1 to 3 to match marketing examples
        maxMembersPerJar: isPro ? 50 : 4,
        aiPlanning: isPro,
        unlimitedIdeas: true, // Ideas are now unlimited for everyone
        googlePhotos: isPro,
    };
}

/**
 * Checks if a user has access to a specific premium feature.
 * Used by the unified Concierge endpoint.
 */
import { prisma } from "@/lib/prisma";

export async function checkSubscriptionAccess(userId: string, toolId: string): Promise<{ allowed: boolean, reason?: string }> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            isLifetimePro: true,
            subscriptionStatus: true,
            createdAt: true
        }
    });

    if (!user) return { allowed: false, reason: 'User not found' };

    // Debug logging for trial issues
    const now = new Date();
    const created = new Date(user.createdAt);
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    console.log('[PREMIUM_CHECK]', {
        userId,
        toolId,
        isLifetimePro: user.isLifetimePro,
        subscriptionStatus: user.subscriptionStatus,
        createdAt: user.createdAt,
        now: now.toISOString(),
        diffDays,
        isWithinTrial: diffDays <= 14
    });

    // 1. Check Pro Status
    if (isUserPro(user as any)) {
        return { allowed: true };
    }

    // 2. Check Demo/Free Limits (Optional - Implementing later)
    // For now, these tools are pro-only
    return { allowed: false, reason: 'Premium subscription required' };
}
