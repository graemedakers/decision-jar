import { Jar, User } from "@prisma/client";

/**
 * Premium Status Determination (Simplified)
 * 
 * Premium features are unlocked if EITHER:
 * 1. User has isLifetimePro = true (user-level premium)
 * 2. User has active subscription (subscriptionStatus = 'active', 'trialing', or 'past_due')
 * 3. Jar has isPremium = true (jar-level premium, for manual overrides)
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

export function getLimits(user: User | null | undefined) {
    const isPro = isUserPro(user);
    return {
        maxJars: isPro ? 50 : 1,
        maxMembersPerJar: isPro ? 50 : 4,
        aiPlanning: isPro,
        unlimitedIdeas: isPro,
        googlePhotos: isPro,
    };
}
