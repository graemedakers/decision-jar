
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { spinJar } from '@/app/actions/spin';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
    prisma: {
        idea: {
            findMany: vi.fn(),
            update: vi.fn(),
        },
        user: {
            findUnique: vi.fn(),
        },
        jarMember: {
            findUnique: vi.fn(),
            findMany: vi.fn(),
        }
    },
}));

// Mock dependencies
vi.mock('@/lib/auth', () => ({ getSession: vi.fn() }));
vi.mock('@/lib/gamification', () => ({ awardXp: vi.fn() }));
vi.mock('@/lib/mailer', () => ({ sendDateNotificationEmail: vi.fn() }));
vi.mock('@/lib/achievements', () => ({ checkAndUnlockAchievements: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { awardXp } from '@/lib/gamification';

describe('Spin Jar Action', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should select a random idea from available ones', async () => {
        const mockSession = { user: { id: 'user-123', email: 'test@example.com' } };
        const mockUser = {
            id: 'user-123',
            activeJarId: 'jar-456',
            memberships: [{ jarId: 'jar-456', role: 'ADMIN' }]
        };

        const mockIdeas = [
            { id: 'idea-1', description: 'Go hiking', selectedAt: null, status: 'APPROVED', cost: '$', duration: 2, activityLevel: 'MEDIUM' },
            { id: 'idea-2', description: 'Movie night', selectedAt: null, status: 'APPROVED', cost: '$', duration: 3, activityLevel: 'LOW' },
        ];

        (getSession as any).mockResolvedValue(mockSession);
        (prisma.user.findUnique as any).mockResolvedValue(mockUser);
        (prisma.idea.findMany as any).mockResolvedValue(mockIdeas);
        (prisma.idea.update as any).mockImplementation(({ where }) => {
            const idea = mockIdeas.find(i => i.id === where.id);
            return { ...idea, selectedAt: new Date(), selectedDate: new Date() };
        });
        (prisma.jarMember.findMany as any).mockResolvedValue([]); // No email recipients

        const result = await spinJar({});

        expect(result.success).toBe(true);
        expect(result.idea).toBeDefined();
        expect(['idea-1', 'idea-2']).toContain(result.idea.id);
        expect(prisma.idea.update).toHaveBeenCalled();
    });

    it('should apply duration filters correctly', async () => {
        const mockSession = { user: { id: 'user-123' } };
        const mockUser = { id: 'user-123', activeJarId: 'jar-456', memberships: [{ jarId: 'jar-456' }] };

        const mockIdeas = [
            { id: 'idea-1', description: 'Quick', duration: 1, cost: '$', activityLevel: 'LOW' },
            { id: 'idea-2', description: 'Long', duration: 5, cost: '$', activityLevel: 'LOW' },
        ];

        (getSession as any).mockResolvedValue(mockSession);
        (prisma.user.findUnique as any).mockResolvedValue(mockUser);
        (prisma.idea.findMany as any).mockResolvedValue(mockIdeas);
        (prisma.idea.update as any).mockResolvedValue({ ...mockIdeas[0], selectedAt: new Date() });
        (prisma.jarMember.findMany as any).mockResolvedValue([]);

        const result = await spinJar({ maxDuration: 2 });

        expect(result.success).toBe(true);
        expect(result.idea.id).toBe('idea-1');
    });

    it('should return error when no active jar', async () => {
        const mockSession = { user: { id: 'user-123' } };
        const mockUser = { id: 'user-123', activeJarId: null, memberships: [] };

        (getSession as any).mockResolvedValue(mockSession);
        (prisma.user.findUnique as any).mockResolvedValue(mockUser);

        const result = await spinJar({});

        expect(result.success).toBe(false);
        expect(result.error).toContain('No active jar');
        expect(result.status).toBe(400);
    });

    it('should return error when no matching ideas', async () => {
        const mockSession = { user: { id: 'user-123' } };
        const mockUser = { id: 'user-123', activeJarId: 'jar-456' };

        (getSession as any).mockResolvedValue(mockSession);
        (prisma.user.findUnique as any).mockResolvedValue(mockUser);
        (prisma.idea.findMany as any).mockResolvedValue([]); // Empty DB result

        const result = await spinJar({});

        expect(result.success).toBe(false);
        expect(result.error).toContain('No matching ideas found'); // String from action
        expect(result.status).toBe(404);
    });

    it('should award gamification XP on successful spin', async () => {
        const mockSession = { user: { id: 'user-123' } };
        const mockUser = { id: 'user-123', activeJarId: 'jar-456' };
        const mockIdeas = [{ id: 'idea-1', cost: '$', duration: 1, activityLevel: 'LOW' }];

        (getSession as any).mockResolvedValue(mockSession);
        (prisma.user.findUnique as any).mockResolvedValue(mockUser);
        (prisma.idea.findMany as any).mockResolvedValue(mockIdeas);
        (prisma.idea.update as any).mockResolvedValue(mockIdeas[0]);
        (prisma.jarMember.findMany as any).mockResolvedValue([]);

        await spinJar({});

        // Wait for async background tasks (not awaited in action)
        await new Promise(process.nextTick);

        expect(awardXp).toHaveBeenCalledWith('jar-456', 5);
    });

    it('should return error for invalid duration range', async () => {
        const mockSession = { user: { id: 'user-123' } };
        const mockUser = { id: 'user-123', activeJarId: 'jar-456' };

        (getSession as any).mockResolvedValue(mockSession);
        (prisma.user.findUnique as any).mockResolvedValue(mockUser);

        const result = await spinJar({ minDuration: 5, maxDuration: 2 });

        expect(result.success).toBe(false);
        expect(result.error).toContain('Invalid duration range');
        expect(result.status).toBe(400);
    });
});
