import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
    prisma: {
        jarMember: {
            findUnique: vi.fn(),
            findFirst: vi.fn(),
        },
        user: {
            findUnique: vi.fn(),
        },
        jar: {
            findUnique: vi.fn(),
        },
    },
}));

import { prisma } from '@/lib/prisma';

/**
 * Permission Helper Functions
 * These would typically be in a lib/permissions.ts file
 */
async function isUserAdminOfJar(userId: string, jarId: string): Promise<boolean> {
    const membership = await prisma.jarMember.findFirst({
        where: {
            userId,
            jarId,
            status: 'ACTIVE',
            role: 'ADMIN',
        },
    });
    return !!membership;
}

async function canUserAccessJar(userId: string, jarId: string): Promise<boolean> {
    const membership = await prisma.jarMember.findFirst({
        where: {
            userId,
            jarId,
            status: 'ACTIVE',
        },
    });
    return !!membership;
}

async function canUserEditIdea(userId: string, ideaId: string): Promise<boolean> {
    const idea = await (prisma as any).idea?.findUnique({
        where: { id: ideaId },
        include: {
            jar: {
                include: {
                    members: {
                        where: {
                            userId,
                            status: 'ACTIVE',
                        },
                    },
                },
            },
        },
    });

    if (!idea) return false;

    // Creator can always edit
    if (idea.createdById === userId) return true;

    // Admin can edit any idea in their jar
    const isAdmin = idea.jar.members.some((m: any) => m.role === 'ADMIN');
    return isAdmin;
}

describe('Permission System', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('isUserAdminOfJar', () => {
        it('should return true for admin users', async () => {
            (prisma.jarMember.findFirst as any).mockResolvedValue({
                id: 'membership-1',
                userId: 'user-123',
                jarId: 'jar-456',
                role: 'ADMIN',
                status: 'ACTIVE',
            });

            const result = await isUserAdminOfJar('user-123', 'jar-456');

            expect(result).toBe(true);
            expect(prisma.jarMember.findFirst).toHaveBeenCalledWith({
                where: {
                    userId: 'user-123',
                    jarId: 'jar-456',
                    status: 'ACTIVE',
                    role: 'ADMIN',
                },
            });
        });

        it('should return false for member users', async () => {
            (prisma.jarMember.findFirst as any).mockResolvedValue(null);

            const result = await isUserAdminOfJar('user-123', 'jar-456');

            expect(result).toBe(false);
        });

        it('should return false for inactive memberships', async () => {
            (prisma.jarMember.findFirst as any).mockResolvedValue(null);

            const result = await isUserAdminOfJar('user-123', 'jar-456');

            expect(result).toBe(false);
        });
    });

    describe('canUserAccessJar', () => {
        it('should allow access for active members', async () => {
            (prisma.jarMember.findFirst as any).mockResolvedValue({
                id: 'membership-1',
                userId: 'user-123',
                jarId: 'jar-456',
                role: 'MEMBER',
                status: 'ACTIVE',
            });

            const result = await canUserAccessJar('user-123', 'jar-456');

            expect(result).toBe(true);
        });

        it('should allow access for admin members', async () => {
            (prisma.jarMember.findFirst as any).mockResolvedValue({
                id: 'membership-1',
                userId: 'user-123',
                jarId: 'jar-456',
                role: 'ADMIN',
                status: 'ACTIVE',
            });

            const result = await canUserAccessJar('user-123', 'jar-456');

            expect(result).toBe(true);
        });

        it('should deny access for non-members', async () => {
            (prisma.jarMember.findFirst as any).mockResolvedValue(null);

            const result = await canUserAccessJar('user-123', 'jar-456');

            expect(result).toBe(false);
        });

        it('should deny access for removed members', async () => {
            (prisma.jarMember.findFirst as any).mockResolvedValue(null);

            const result = await canUserAccessJar('user-123', 'jar-456');

            expect(result).toBe(false);
        });
    });

    describe('canUserEditIdea', () => {
        it('should allow idea creator to edit', async () => {
            const mockIdea = {
                id: 'idea-1',
                createdById: 'user-123',
                jar: {
                    members: [],
                },
            };

            (prisma as any).idea = {
                findUnique: vi.fn().mockResolvedValue(mockIdea),
            };

            const result = await canUserEditIdea('user-123', 'idea-1');

            expect(result).toBe(true);
        });

        it('should allow jar admin to edit any idea', async () => {
            const mockIdea = {
                id: 'idea-1',
                createdById: 'user-999',
                jar: {
                    members: [
                        {
                            userId: 'user-123',
                            role: 'ADMIN',
                            status: 'ACTIVE',
                        },
                    ],
                },
            };

            (prisma as any).idea = {
                findUnique: vi.fn().mockResolvedValue(mockIdea),
            };

            const result = await canUserEditIdea('user-123', 'idea-1');

            expect(result).toBe(true);
        });

        it('should deny non-admin members from editing others ideas', async () => {
            const mockIdea = {
                id: 'idea-1',
                createdById: 'user-999',
                jar: {
                    members: [
                        {
                            userId: 'user-123',
                            role: 'MEMBER',
                            status: 'ACTIVE',
                        },
                    ],
                },
            };

            (prisma as any).idea = {
                findUnique: vi.fn().mockResolvedValue(mockIdea),
            };

            const result = await canUserEditIdea('user-123', 'idea-1');

            expect(result).toBe(false);
        });

        it('should deny access for non-existent ideas', async () => {
            (prisma as any).idea = {
                findUnique: vi.fn().mockResolvedValue(null),
            };

            const result = await canUserEditIdea('user-123', 'idea-nonexistent');

            expect(result).toBe(false);
        });
    });

    describe('Edge Cases', () => {
        it('should handle database errors gracefully', async () => {
            (prisma.jarMember.findFirst as any).mockRejectedValue(new Error('Database error'));

            await expect(isUserAdminOfJar('user-123', 'jar-456')).rejects.toThrow('Database error');
        });

        it('should handle null userId', async () => {
            (prisma.jarMember.findFirst as any).mockResolvedValue(null);

            const result = await canUserAccessJar('', 'jar-456');

            expect(result).toBe(false);
        });

        it('should handle null jarId', async () => {
            (prisma.jarMember.findFirst as any).mockResolvedValue(null);

            const result = await canUserAccessJar('user-123', '');

            expect(result).toBe(false);
        });
    });
});
