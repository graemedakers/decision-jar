
import { prismaMock } from '../../libs/prisma';
import { describe, it, expect, beforeEach, vi, afterAll } from 'vitest';
import { QuotaManager } from '@/lib/api/quota-manager';

// Mock dependencies
// Prisma is already mocked via setup/prisma-mock

describe('QuotaManager', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('validateTopicAccess', () => {
        it('should allow whitelisted topics for FREE tier', () => {
            expect(QuotaManager.validateTopicAccess('FREE', 'MOVIE')).toBe(true);
            expect(QuotaManager.validateTopicAccess('FREE', 'DINING')).toBe(true);
        });

        it('should deny non-whitelisted topics for FREE tier', () => {
            expect(QuotaManager.validateTopicAccess('FREE', 'RECIPE')).toBe(false);
            expect(QuotaManager.validateTopicAccess('FREE', 'ADVANCED_AI')).toBe(false);
        });

        it('should allow all topics for PRO tier', () => {
            expect(QuotaManager.validateTopicAccess('PRO', 'RECIPE')).toBe(true);
            expect(QuotaManager.validateTopicAccess('PRO', 'ANYTHING')).toBe(true);
        });
    });

    describe('checkQuota', () => {
        it('should deny if key not found', async () => {
            prismaMock.apiKey.findUnique.mockResolvedValue(null);
            const result = await QuotaManager.checkQuota('fake-key');
            expect(result.allowed).toBe(false);
            expect(result.reason).toBe('Invalid API Key');
        });

        it('should deny if key is inactive', async () => {
            prismaMock.apiKey.findUnique.mockResolvedValue({ id: 'k1', isActive: false } as any);
            const result = await QuotaManager.checkQuota('inactive-key');
            expect(result.allowed).toBe(false);
            expect(result.reason).toBe('API Key is inactive');
        });

        it('should fail if quota exceeded and not reset', async () => {
            prismaMock.apiKey.findUnique.mockResolvedValue({
                id: 'k1',
                isActive: true,
                monthlyLimit: 100,
                usedThisMonth: 100, // Full
                resetAt: new Date(Date.now() + 100000), // Future reset
                tier: 'FREE'
            } as any);

            const result = await QuotaManager.checkQuota('full-key');
            expect(result.allowed).toBe(false);
            expect(result.reason).toContain('exceeded');
        });

        it('should reset quota if resetAt is in the past', async () => {
            const pastDate = new Date();
            pastDate.setMonth(pastDate.getMonth() - 1);

            prismaMock.apiKey.findUnique.mockResolvedValue({
                id: 'k1',
                isActive: true,
                monthlyLimit: 100,
                usedThisMonth: 100, // Full but old
                resetAt: pastDate,
                tier: 'FREE'
            } as any);

            // Prisma update should be called to reset
            prismaMock.apiKey.update.mockResolvedValue({} as any);

            const result = await QuotaManager.checkQuota('expired-key');

            // Should now allow because it was reset
            expect(result.allowed).toBe(true);
            expect(prismaMock.apiKey.update).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    usedThisMonth: 0
                })
            }));
        });
    });

    describe('recordUsage', () => {
        it('should increment usage and log event', async () => {
            prismaMock.apiKey.findUnique.mockResolvedValue({
                id: 'k1',
                usedThisMonth: 50,
                monthlyLimit: 100,
                tier: 'FREE'
            } as any);

            await QuotaManager.recordUsage('k1', '/test');

            expect(prismaMock.apiKey.update).toHaveBeenCalled();
            expect(prismaMock.apiUsage.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    apiKeyId: 'k1',
                    tokensUsed: 1
                })
            }));
        });

        it('should trigger webhook if threshold reached', async () => {
            // Mock FETCH
            const fetchMock = vi.fn().mockResolvedValue({ ok: true });
            global.fetch = fetchMock;

            prismaMock.apiKey.findUnique.mockResolvedValue({
                id: 'k1',
                usedThisMonth: 89,
                monthlyLimit: 100,
                tier: 'FREE',
                webhookUrl: 'http://test.com/hook',
                lastNotificationLevel: 0
            } as any);

            // 89 + 1 = 90 usage -> 90% threshold
            await QuotaManager.recordUsage('k1', '/test');

            expect(fetchMock).toHaveBeenCalledWith('http://test.com/hook', expect.anything());
            expect(prismaMock.apiKey.update).toHaveBeenCalledWith(expect.objectContaining({
                data: { lastNotificationLevel: 90 }
            }));
        });
    });
});
