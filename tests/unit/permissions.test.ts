import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkJarPermission, getEffectiveJarId } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { MemberRole } from '@prisma/client';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
    prisma: {
        jarMember: {
            findUnique: vi.fn(),
        },
        user: {
            findUnique: vi.fn(),
        },
    },
}));

describe('Permission Utilities', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('checkJarPermission', () => {
        it('should return error if not a member', async () => {
            (prisma.jarMember.findUnique as any).mockResolvedValue(null);

            const result = await checkJarPermission('user1', 'jar1');

            expect(result.allowed).toBe(false);
            expect(result.error).toBe('Not a member of this jar');
        });

        it('should return error if membership is inctive', async () => {
            (prisma.jarMember.findUnique as any).mockResolvedValue({
                role: 'MEMBER',
                status: 'INACTIVE',
                jar: { id: 'jar1' }
            });

            const result = await checkJarPermission('user1', 'jar1');
            expect(result.allowed).toBe(false);
            expect(result.error).toBe('Membership is not active');
        });

        it('should return error if role is insufficient', async () => {
            (prisma.jarMember.findUnique as any).mockResolvedValue({
                role: 'MEMBER',
                status: 'ACTIVE',
                jar: { id: 'jar1' }
            });

            // Require ADMIN
            const result = await checkJarPermission('user1', 'jar1', 'ADMIN');
            expect(result.allowed).toBe(false);
            expect(result.error).toContain('Requires ADMIN access');
        });

        it('should allow if role is sufficient', async () => {
            (prisma.jarMember.findUnique as any).mockResolvedValue({
                role: 'ADMIN',
                status: 'ACTIVE',
                jar: { id: 'jar1' }
            });

            // Require MEMBER
            const result = await checkJarPermission('user1', 'jar1', 'MEMBER');
            expect(result.allowed).toBe(true);
            expect(result.membership?.role).toBe('ADMIN');
        });
    });

    describe('getEffectiveJarId', () => {
        it('should return activeJarId if set', async () => {
            (prisma.user.findUnique as any).mockResolvedValue({
                activeJarId: 'jar_active',
                memberships: []
            });

            const jarId = await getEffectiveJarId('user1');
            expect(jarId).toBe('jar_active');
        });

        it('should fallback to first membership if activeJarId is null', async () => {
            (prisma.user.findUnique as any).mockResolvedValue({
                activeJarId: null,
                memberships: [{ jarId: 'jar_fallback' }]
            });

            const jarId = await getEffectiveJarId('user1');
            expect(jarId).toBe('jar_fallback');
        });

        it('should return null if no jars found', async () => {
            (prisma.user.findUnique as any).mockResolvedValue({
                activeJarId: null,
                memberships: []
            });

            const jarId = await getEffectiveJarId('user1');
            expect(jarId).toBeNull();
        });
    });
});

