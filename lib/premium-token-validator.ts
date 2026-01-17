import { prisma } from '@/lib/prisma';

export interface TokenValidationResult {
    isValid: boolean;
    reason?: 'not_found' | 'expired' | 'inactive' | 'max_uses_reached';
    tokenRecord?: {
        id: string;
        token: string;
        expiresAt: Date;
        maxUses: number;
        currentUses: number;
        isActive: boolean;
    };
}

/**
 * Validates a premium invite token.
 * 
 * Checks the PremiumInviteToken table first, then falls back to legacy
 * User.premiumInviteToken field for backward compatibility.
 * 
 * @param token - The token string to validate
 * @returns TokenValidationResult with isValid flag and optional reason/record
 */
export async function validatePremiumToken(token: string): Promise<TokenValidationResult> {
    if (!token) {
        return { isValid: false, reason: 'not_found' };
    }

    // First, check the PremiumInviteToken table (new secure system)
    const tokenRecord = await prisma.premiumInviteToken.findUnique({
        where: { token },
        include: {
            createdBy: {
                select: { isSuperAdmin: true }
            }
        }
    });

    if (!tokenRecord) {
        // FALLBACK: Check legacy User.premiumInviteToken field
        // This ensures old tokens generated before the migration still work
        const legacyUser = await prisma.user.findFirst({
            where: { premiumInviteToken: token },
            select: { isSuperAdmin: true }
        });

        if (legacyUser?.isSuperAdmin) {
            console.log(`[PREMIUM_TOKEN] Legacy token validated: ${token.substring(0, 8)}...`);
            return { isValid: true }; // Legacy token, no record to update
        }

        console.log(`[PREMIUM_TOKEN] Token not found: ${token.substring(0, 8)}...`);
        return { isValid: false, reason: 'not_found' };
    }

    // Check if token is active
    if (!tokenRecord.isActive) {
        console.log(`[PREMIUM_TOKEN] Token deactivated: ${token.substring(0, 8)}...`);
        return { isValid: false, reason: 'inactive' };
    }

    // Check expiration
    if (new Date() > tokenRecord.expiresAt) {
        console.log(`[PREMIUM_TOKEN] Token expired: ${token.substring(0, 8)}... (expired ${tokenRecord.expiresAt.toISOString()})`);
        return { isValid: false, reason: 'expired' };
    }

    // Check usage limit
    if (tokenRecord.currentUses >= tokenRecord.maxUses) {
        console.log(`[PREMIUM_TOKEN] Token max uses reached: ${token.substring(0, 8)}... (${tokenRecord.currentUses}/${tokenRecord.maxUses})`);
        return { isValid: false, reason: 'max_uses_reached' };
    }

    console.log(`[PREMIUM_TOKEN] Token valid: ${token.substring(0, 8)}... (uses: ${tokenRecord.currentUses}/${tokenRecord.maxUses})`);
    return {
        isValid: true,
        tokenRecord: {
            id: tokenRecord.id,
            token: tokenRecord.token,
            expiresAt: tokenRecord.expiresAt,
            maxUses: tokenRecord.maxUses,
            currentUses: tokenRecord.currentUses,
            isActive: tokenRecord.isActive
        }
    };
}

/**
 * Records that a token was used by a user.
 * 
 * Increments the usage counter and optionally records the user who redeemed it.
 * For tokens that can be used multiple times, only the LAST user is recorded in usedById.
 * 
 * @param token - The token that was used
 * @param userId - The user who redeemed the token
 * @param method - How the token was redeemed ('signup' or 'join')
 */
export async function recordTokenUsage(
    token: string,
    userId: string,
    method: 'signup' | 'join' = 'signup'
): Promise<void> {
    try {
        await prisma.premiumInviteToken.update({
            where: { token },
            data: {
                currentUses: { increment: 1 },
                usedById: userId,
                usedAt: new Date()
            }
        });
        console.log(`[PREMIUM_TOKEN] Usage recorded: token=${token.substring(0, 8)}... user=${userId} method=${method}`);

        // Log detailed redemption for analytics
        await logTokenRedemption(token, userId, method, true);
    } catch (error) {
        // Token might be legacy (not in table), just log and continue
        console.log(`[PREMIUM_TOKEN] Could not update usage (likely legacy token): ${token.substring(0, 8)}...`);

        // Still log the redemption even for legacy tokens
        await logTokenRedemption(token, userId, method, true);
    }
}

/**
 * Logs a detailed token redemption event for analytics and auditing.
 * 
 * @param token - The token that was redeemed
 * @param userId - The user who redeemed the token
 * @param method - How the token was redeemed ('signup' or 'join')
 * @param success - Whether the redemption was successful
 */
export async function logTokenRedemption(
    token: string,
    userId: string,
    method: 'signup' | 'join',
    success: boolean
): Promise<void> {
    const timestamp = new Date().toISOString();
    const tokenPrefix = token.substring(0, 8);

    // Structured JSON log for server-side analysis (Vercel logs, log aggregators)
    console.log(JSON.stringify({
        event: 'premium_token_redeemed',
        timestamp,
        tokenPrefix,
        userId,
        method,
        success
    }));

    // Note: PostHog tracking happens client-side after the API response
    // Server-side PostHog would require posthog-node package
}

/**
 * Gets token usage statistics for admin reporting.
 * 
 * @param creatorId - The admin who created the tokens
 * @returns Summary of token usage
 */
export async function getTokenStats(creatorId: string): Promise<{
    totalTokens: number;
    activeTokens: number;
    totalRedemptions: number;
    recentRedemptions: Array<{
        token: string;
        usedAt: Date | null;
        usedById: string | null;
    }>;
}> {
    const tokens = await prisma.premiumInviteToken.findMany({
        where: { createdById: creatorId },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            token: true,
            isActive: true,
            expiresAt: true,
            currentUses: true,
            maxUses: true,
            usedAt: true,
            usedById: true
        }
    });

    const now = new Date();
    const activeTokens = tokens.filter(t =>
        t.isActive &&
        t.expiresAt > now &&
        t.currentUses < t.maxUses
    );

    const totalRedemptions = tokens.reduce((sum, t) => sum + t.currentUses, 0);

    const recentRedemptions = tokens
        .filter(t => t.usedAt)
        .sort((a, b) => (b.usedAt?.getTime() || 0) - (a.usedAt?.getTime() || 0))
        .slice(0, 10)
        .map(t => ({
            token: t.token.substring(0, 8) + '...',
            usedAt: t.usedAt,
            usedById: t.usedById
        }));

    return {
        totalTokens: tokens.length,
        activeTokens: activeTokens.length,
        totalRedemptions,
        recentRedemptions
    };
}

