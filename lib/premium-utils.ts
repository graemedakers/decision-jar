import { Jar, User } from "@prisma/client";

/**
 * Unified Premium Status Utilities
 * 
 * SINGLE SOURCE OF TRUTH for all premium checks across the application.
 * 
 * @module premium-utils
 */

/**
 * Determines if a user has pro status at the USER level.
 * 
 * Pro status is granted if ANY of:
 * 1. User has isLifetimePro = true
 * 2. User has active/trialing/past_due subscription
 * 3. User is within 14-day grace period from account creation
 * 
 * @param user - User object from database
 * @returns boolean indicating pro status
 */
export function isUserPro(user: User | null | undefined): boolean {
    if (!user) return false;

    // 0. Super Admin (Always Pro)
    if (user.isSuperAdmin) return true;

    // 1. Lifetime Pro
    if (user.isLifetimePro) return true;

    // 2. Active Subscription (including trial and grace period)
    const activeStatuses = ['active', 'trialing', 'past_due'];
    if (user.subscriptionStatus && activeStatuses.includes(user.subscriptionStatus)) {
        return true;
    }

    // 3. Automatic 14-Day Grace Period
    const now = new Date();
    const created = new Date(user.createdAt);
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 14) {
        return true;
    }

    return false;
}

/**
 * Determines if a jar has premium status at the JAR level.
 * 
 * Jar premium is granted if ANY of:
 * 1. Jar has isPremium = true (manual override)
 * 2. Jar is within 14-day trial period AND isTrialEligible
 * 
 * @param jar - Jar object from database
 * @returns boolean indicating jar premium status
 */
export function isJarPremium(jar: Jar | null | undefined): boolean {
    if (!jar) return false;

    // 1. Manual/Legacy Premium Override
    if (jar.isPremium === true) return true;

    // 2. Automatic 14-Day Jar Trial (only if eligible)
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
 * MAIN FUNCTION: Determines effective premium status.
 * 
 * This is the PRIMARY function to use for premium feature gates.
 * Returns true if EITHER user OR jar has premium status.
 * 
 * Use this when checking if premium features should be enabled.
 * 
 * @param user - User object from database
 * @param jar - Optional jar object (if checking jar-specific features)
 * @returns boolean indicating effective premium status
 * 
 * @example
 * // Check if user can create unlimited jars
 * const canCreate = getEffectivePremiumStatus(user);
 * 
 * @example
 * // Check if AI tools are available for this jar
 * const hasAI = getEffectivePremiumStatus(user, jar);
 */
export function getEffectivePremiumStatus(
    user: User | null | undefined,
    jar?: Jar | null | undefined
): boolean {
    const userIsPro = isUserPro(user);
    const jarIsPremium = jar ? isJarPremium(jar) : false;

    return userIsPro || jarIsPremium;
}

/**
 * Determines if user/jar has ACTUALLY paid (excluding trials/grace periods).
 * 
 * Use this to determine if upgrade prompts should be shown.
 * Returns false during free trials even if premium features are enabled.
 * 
 * @param user - User object
 * @param jar - Optional jar object
 * @returns boolean indicating if payment has been made
 */
export function hasActuallyPaid(
    user: User | null | undefined,
    jar?: Jar | null | undefined
): boolean {
    if (!user) return false;

    // Check user-level payment
    const userPaid = user.isSuperAdmin || user.isLifetimePro ||
        (user.subscriptionStatus && ['active', 'trialing', 'past_due'].includes(user.subscriptionStatus));

    // Check jar-level payment
    const jarPaid = jar ? jar.isPremium === true : false;

    return userPaid || jarPaid;
}

/**
 * Gets feature limits based on premium status.
 * 
 * @param user - User object
 * @param jar - Optional jar object
 * @returns Object containing feature limits
 */
export function getFeatureLimits(
    user: User | null | undefined,
    jar?: Jar | null | undefined
) {
    const isPremium = getEffectivePremiumStatus(user, jar);

    return {
        maxJars: isPremium ? 50 : 3,
        maxMembersPerJar: isPremium ? 50 : 4,
        aiPlanning: isPremium,
        unlimitedIdeas: true, // Always true for everyone
        googlePhotos: isPremium,
        conciergeTools: isPremium,
        customCategories: isPremium,
    };
}

/**
 * Legacy compatibility exports.
 * These maintain backward compatibility with existing code.
 * 
 * @deprecated Use getEffectivePremiumStatus instead
 */
export const isCouplePremium = isJarPremium; // Alias for legacy code
export const hasJarActuallyPaid = (jar: Jar | null | undefined) => jar?.isPremium === true;

export const getLimits = (user: User | null | undefined) => getFeatureLimits(user);
