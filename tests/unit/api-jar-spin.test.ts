
import { prismaMock } from '../libs/prisma';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { spinJar } from '@/app/actions/spin';

// Mock dependencies
vi.mock('@/lib/auth', () => ({ getSession: vi.fn() }));
vi.mock('@/lib/gamification', () => ({
    awardXp: vi.fn(),
    updateStreak: vi.fn()
}));
vi.mock('@/lib/mailer', () => ({ sendDateNotificationEmail: vi.fn() }));
vi.mock('@/lib/achievements', () => ({ checkAndUnlockAchievements: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import { getSession } from '@/lib/auth';
import { awardXp } from '@/lib/gamification';

describe('Spin Jar Action', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock transaction to execute callback immediately
        prismaMock.$transaction.mockImplementation(async (callback) => {
            if (typeof callback === 'function') {
                return callback(prismaMock);
            }
            return callback;
        });
    });

    it('should allow OWNER to spin', async () => {
        const mockSession = { user: { id: 'owner-123', email: 'owner@example.com' } };
        const mockUser = {
            id: 'owner-123',
            activeJarId: 'jar-456',
            memberships: [{
                jarId: 'jar-456',
                role: 'OWNER',
                jar: { id: 'jar-456', revealPace: 'ON_DEMAND', lastRevealAt: null }
            }]
        };

        const mockIdeas = [
            { id: 'idea-1', description: 'Go hiking', selectedAt: null, status: 'APPROVED', cost: '$', duration: 2, activityLevel: 'MEDIUM' },
        ];

        (getSession as any).mockResolvedValue(mockSession);
        prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
        prismaMock.idea.findMany.mockResolvedValue(mockIdeas as any);
        prismaMock.idea.update.mockImplementation(({ where }: { where: { id: string } }) => {
            const idea = mockIdeas.find(i => i.id === where.id);
            return { ...idea, selectedAt: new Date(), selectedDate: new Date() } as any;
        });
        prismaMock.jarMember.findMany.mockResolvedValue([]);
        // Specific mock for permission check
        prismaMock.jarMember.findUnique.mockResolvedValue({ role: 'OWNER', userId: 'owner-123', jarId: 'jar-456' } as any);

        const result = await spinJar({});

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.idea).toBeDefined();
        }
    });

    it('should allow ADMIN to spin', async () => {
        const mockSession = { user: { id: 'admin-123' } };
        const mockUser = {
            id: 'admin-123',
            activeJarId: 'jar-456',
            memberships: [{
                jarId: 'jar-456',
                role: 'ADMIN',
                jar: { id: 'jar-456', revealPace: 'ON_DEMAND', lastRevealAt: null }
            }]
        };
        const mockIdeas = [{ id: 'idea-1', selectedAt: null }];

        (getSession as any).mockResolvedValue(mockSession);
        prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
        prismaMock.idea.findMany.mockResolvedValue(mockIdeas as any);
        prismaMock.idea.update.mockImplementation(({ where }: any) => ({ ...mockIdeas[0], selectedAt: new Date() } as any));
        prismaMock.jarMember.findMany.mockResolvedValue([]);
        prismaMock.jarMember.findUnique.mockResolvedValue({ role: 'ADMIN', userId: 'admin-123', jarId: 'jar-456' } as any);

        const result = await spinJar({});
        expect(result.success).toBe(true);
    });

    it('should apply duration filters correctly', async () => {
        const mockSession = { user: { id: 'user-123' } };
        const mockUser = {
            id: 'user-123',
            activeJarId: 'jar-456',
            memberships: [{
                jarId: 'jar-456',
                role: 'ADMIN',
                jar: { id: 'jar-456', revealPace: 'ON_DEMAND', lastRevealAt: null }
            }]
        };

        const mockIdeas = [
            { id: 'idea-1', description: 'Quick', duration: 1, cost: '$', activityLevel: 'LOW' },
            { id: 'idea-2', description: 'Long', duration: 5, cost: '$', activityLevel: 'LOW' },
        ];

        (getSession as any).mockResolvedValue(mockSession);
        prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
        prismaMock.idea.findMany.mockResolvedValue(mockIdeas as any);
        prismaMock.idea.update.mockResolvedValue({ ...mockIdeas[0], selectedAt: new Date() } as any);
        prismaMock.jarMember.findMany.mockResolvedValue([]);
        prismaMock.jarMember.findUnique.mockResolvedValue({ role: 'ADMIN', userId: 'user-123', jarId: 'jar-456' } as any);

        const result = await spinJar({ maxDuration: 2 });

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.idea.id).toBe('idea-1');
        }
    });

    it('should return error when no active jar', async () => {
        const mockSession = { user: { id: 'user-123' } };
        const mockUser = { id: 'user-123', activeJarId: null, memberships: [] };

        (getSession as any).mockResolvedValue(mockSession);
        prismaMock.user.findUnique.mockResolvedValue(mockUser as any);

        const result = await spinJar({});

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error).toContain('No active jar');
            expect(result.status).toBe(400);
        }
    });

    it('should return error when no matching ideas', async () => {
        const mockSession = { user: { id: 'user-123' } };
        const mockUser = {
            id: 'user-123',
            activeJarId: 'jar-456',
            memberships: [{
                role: 'ADMIN',
                jarId: 'jar-456',
                jar: { id: 'jar-456', revealPace: 'ON_DEMAND', lastRevealAt: null }
            }]
        };

        (getSession as any).mockResolvedValue(mockSession);
        prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
        prismaMock.idea.findMany.mockResolvedValue([]); // Empty DB result
        prismaMock.jarMember.findUnique.mockResolvedValue({ role: 'ADMIN', userId: 'user-123', jarId: 'jar-456' } as any);

        const result = await spinJar({});

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error).toContain('No matching ideas found'); // String from action
            expect(result.status).toBe(404);
        }
    });

    it('should award gamification XP on successful spin', async () => {
        const mockSession = { user: { id: 'user-123' } };
        const mockUser = {
            id: 'user-123',
            activeJarId: 'jar-456',
            memberships: [{
                role: 'ADMIN',
                jarId: 'jar-456',
                jar: { id: 'jar-456', revealPace: 'ON_DEMAND', lastRevealAt: null }
            }]
        };
        const mockIdeas = [{ id: 'idea-1', cost: '$', duration: 1, activityLevel: 'LOW' }];

        (getSession as any).mockResolvedValue(mockSession);
        prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
        prismaMock.idea.findMany.mockResolvedValue(mockIdeas as any);
        prismaMock.idea.update.mockResolvedValue(mockIdeas[0] as any);
        prismaMock.jar.update.mockResolvedValue({} as any); // Jar update for lastRevealAt
        prismaMock.jarMember.findMany.mockResolvedValue([]);
        prismaMock.jarMember.findUnique.mockResolvedValue({ role: 'ADMIN', userId: 'user-123', jarId: 'jar-456' } as any);

        await spinJar({});

        // Wait for async background tasks (not awaited in action)
        await new Promise(process.nextTick);

        expect(awardXp).toHaveBeenCalledWith('jar-456', 5);
    });

    it('should return error for invalid duration range', async () => {
        const mockSession = { user: { id: 'user-123' } };
        const mockUser = { id: 'user-123', activeJarId: 'jar-456' };

        (getSession as any).mockResolvedValue(mockSession);
        prismaMock.user.findUnique.mockResolvedValue(mockUser as any);

        const result = await spinJar({ minDuration: 5, maxDuration: 2 });

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error).toContain('Invalid duration range');
            expect(result.status).toBe(400);
        }
    });
});
