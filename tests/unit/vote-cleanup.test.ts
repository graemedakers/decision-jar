
import { prismaMock } from '../libs/prisma';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { updateJar } from '@/app/actions/jars';

// Mock dependencies
vi.mock('@/lib/auth', () => ({ getSession: vi.fn() }));
vi.mock('@/lib/rate-limit', () => ({ checkRateLimit: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import { getSession } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';

describe('Vote Cleanup Logic (updateJar)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should cancel active votes when switching FROM Vote TO Random', async () => {
        const mockSession = { user: { id: 'admin-123', email: 'admin@test.com' } };
        const jarId = 'jar-123';

        // Mocks
        (getSession as any).mockResolvedValue(mockSession);
        (checkRateLimit as any).mockResolvedValue({ allowed: true });

        // Mock User with Membership and Jar (Current mode = VOTE)
        const mockUser = {
            id: 'admin-123',
            memberships: [{
                jarId: jarId,
                role: 'ADMIN',
                jar: {
                    id: jarId,
                    selectionMode: 'VOTE',
                    isMysteryMode: false
                }
            }]
        };

        prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
        prismaMock.jar.update.mockResolvedValue({ id: jarId } as any);

        // ACT: Switch to RANDOM
        const result = await updateJar(jarId, { selectionMode: 'RANDOM' });

        // ASSERT
        expect(result.success).toBe(true);
        expect(prismaMock.voteSession.updateMany).toHaveBeenCalledWith({
            where: { jarId: jarId, status: 'ACTIVE' },
            data: { status: 'CANCELLED' }
        });
    });

    it('should NOT cancel votes when switching FROM Random TO Vote', async () => {
        const mockSession = { user: { id: 'admin-123', email: 'admin@test.com' } };
        const jarId = 'jar-123';

        // Mocks
        (getSession as any).mockResolvedValue(mockSession);
        (checkRateLimit as any).mockResolvedValue({ allowed: true });

        // Mock User with Membership (Current mode = RANDOM)
        const mockUser = {
            id: 'admin-123',
            memberships: [{
                jarId: jarId,
                role: 'ADMIN',
                jar: {
                    id: jarId,
                    selectionMode: 'RANDOM',
                    isMysteryMode: false
                }
            }]
        };

        // Mock Member count (needed for switching TO vote)
        prismaMock.jarMember.count.mockResolvedValue(5);

        prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
        prismaMock.jar.update.mockResolvedValue({ id: jarId } as any);

        // ACT: Switch to VOTE
        const result = await updateJar(jarId, { selectionMode: 'VOTE' });

        // ASSERT
        expect(result.success).toBe(true);
        expect(prismaMock.voteSession.updateMany).not.toHaveBeenCalled();
    });

    it('should NOT cancel votes when updating specific settings but keeping VOTE mode', async () => {
        const mockSession = { user: { id: 'admin-123', email: 'admin@test.com' } };
        const jarId = 'jar-123';

        // Mocks
        (getSession as any).mockResolvedValue(mockSession);
        (checkRateLimit as any).mockResolvedValue({ allowed: true });

        // Mock User (Current mode = VOTE)
        const mockUser = {
            id: 'admin-123',
            memberships: [{
                jarId: jarId,
                role: 'ADMIN',
                jar: {
                    id: jarId,
                    selectionMode: 'VOTE',
                    isMysteryMode: false
                }
            }]
        };

        prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
        prismaMock.jar.update.mockResolvedValue({ id: jarId } as any);

        // ACT: Update Name only, logic implied selectionMode is technically "undefined" in update payload but we check if it is changing
        const result = await updateJar(jarId, { name: 'New Name' });

        // ASSERT
        expect(result.success).toBe(true);
        expect(prismaMock.voteSession.updateMany).not.toHaveBeenCalled();
    });
});
