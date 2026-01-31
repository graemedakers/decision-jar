import { prisma } from '@/lib/prisma';

export interface QuotaStatus {
    allowed: boolean;
    reason?: string;
    tier?: string;
    remaining?: number;
    apiKeyId?: string; // Return ID for logging
}

export class QuotaManager {
    /**
     * Topic Access Control
     */
    static readonly FREE_TIER_TOPICS = ['CONCIERGE', 'DINING', 'MOVIE', 'BOOK'];

    static validateTopicAccess(tier: string, topic: string): boolean {
        if (tier === 'FREE') {
            return QuotaManager.FREE_TIER_TOPICS.includes(topic);
        }
        // PRO, STARTER, ENTERPRISE have full access
        return true;
    }

    /**
     * Validates API Key and checks quota.
     * Handles monthly resets automatically.
     */
    static async checkQuota(key: string): Promise<QuotaStatus> {
        // 1. Find Key
        const apiKey = await prisma.apiKey.findUnique({
            where: { key },
        });

        if (!apiKey) {
            return { allowed: false, reason: 'Invalid API Key' };
        }

        if (!apiKey.isActive) {
            return { allowed: false, reason: 'API Key is inactive' };
        }

        // 2. Check Reset (Monthly)
        const now = new Date();
        if (now > apiKey.resetAt) {
            // It's a new month! Reset usage.
            // Calculate next reset date (same time next month)
            const nextReset = new Date(apiKey.resetAt);
            nextReset.setMonth(nextReset.getMonth() + 1);

            // Handle edge case where next month doesn't have the same day (e.g. Jan 31 -> Feb 28)
            // But simple setMonth handles it by overflow usually, or we can use library. 
            // For MVP, just ensure it's in the future.
            if (nextReset <= now) {
                nextReset.setMonth(now.getMonth() + 1);
            }

            // Reset DB record
            await prisma.apiKey.update({
                where: { id: apiKey.id },
                data: {
                    usedThisMonth: 0,
                    resetAt: nextReset
                }
            });

            // Update local object to reflect reset
            apiKey.usedThisMonth = 0;
            apiKey.resetAt = nextReset;
        }

        // 3. Check Restriction (Overage)
        // For MVP, hard block if over limit.
        if (apiKey.monthlyLimit > -1 && apiKey.usedThisMonth >= apiKey.monthlyLimit) {
            return {
                allowed: false,
                reason: 'Monthly quota exceeded',
                tier: apiKey.tier,
                remaining: 0,
                apiKeyId: apiKey.id
            };
        }

        return {
            allowed: true,
            tier: apiKey.tier,
            remaining: (apiKey.monthlyLimit === -1) ? Infinity : (apiKey.monthlyLimit - apiKey.usedThisMonth),
            apiKeyId: apiKey.id
        };
    }

    /**
     * Records usage after a successful API call.
     */
    static async recordUsage(apiKeyId: string, endpoint: string, tokensUsed: number = 1) {
        try {
            // Fetch key first to get current details for webhook logic
            const apiKey = await prisma.apiKey.findUnique({
                where: { id: apiKeyId }
            });

            if (!apiKey) return;

            const newUsage = apiKey.usedThisMonth + 1;
            const limit = apiKey.monthlyLimit;
            let levelToNotify = 0;

            // Webhook Trigger Logic
            if (limit > 0 && apiKey.webhookUrl) {
                const percentage = (newUsage / limit) * 100;

                if (percentage >= 100) levelToNotify = 100;
                else if (percentage >= 90) levelToNotify = 90;
                else if (percentage >= 80) levelToNotify = 80;

                if (levelToNotify > apiKey.lastNotificationLevel) {
                    // Fire webhook (non-blocking)
                    fetch(apiKey.webhookUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            event: 'quota_threshold_breached',
                            tier: apiKey.tier,
                            threshold_percentage: levelToNotify,
                            current_usage: newUsage,
                            limit: limit,
                            timestamp: new Date().toISOString()
                        })
                    }).catch(err => console.error(`[QuotaManager] Webhook failed for ${apiKeyId}`, err));

                    // Update notification level
                    await prisma.apiKey.update({
                        where: { id: apiKeyId },
                        data: { lastNotificationLevel: levelToNotify }
                    });
                }
            }

            await prisma.$transaction([
                // Increment Usage on Key
                prisma.apiKey.update({
                    where: { id: apiKeyId },
                    data: { usedThisMonth: { increment: 1 } }
                }),
                // Log Usage Event
                prisma.apiUsage.create({
                    data: {
                        apiKeyId,
                        endpoint,
                        tokensUsed
                    }
                })
            ]);
        } catch (error) {
            console.error(`[QuotaManager] Failed to record usage for key ${apiKeyId}:`, error);
        }
    }
}
