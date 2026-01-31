import { prismaMock } from '../../libs/prisma';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createJar, updateJar, deleteJar } from '@/app/actions/jars';
import { getSession } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
    getSession: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
    checkRateLimit: vi.fn(),
}));

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

vi.mock('@/lib/premium-utils', () => ({
    getFeatureLimits: vi.fn().mockReturnValue({ maxJars: 5 }),
}));

vi.mock('@/lib/utils', () => ({
    generateUniqueJarCode: vi.fn().mockResolvedValue('ABC-123'),
}));

describe('Jar Actions', () => {
    beforeEach(() => {
        // prismaMock is reset in ../../libs/prisma.ts, but we clear other mocks here
        vi.clearAllMocks();

        // Default safe mocks
        prismaMock.giftToken.findMany.mockResolvedValue([]);
        prismaMock.user.updateMany.mockResolvedValue({ count: 0 });
        prismaMock.jar.updateMany.mockResolvedValue({ count: 0 });
        prismaMock.giftToken.deleteMany.mockResolvedValue({ count: 0 });
        prismaMock.jar.delete.mockResolvedValue({} as any);
    });

    describe('createJar', () => {
        it('should return 401 if not authenticated', async () => {
            (getSession as any).mockResolvedValue(null);
            const res = await createJar({ name: 'Test Jar' });
            expect(res.success).toBe(false);
            expect(res.status).toBe(401);
        });

        it('should return 429 if rate limit exceeded', async () => {
            (getSession as any).mockResolvedValue({ user: { id: 'user1', email: 'test@example.com' } });
            (checkRateLimit as any).mockResolvedValue({ allowed: false });

            const res = await createJar({ name: 'Test Jar' });
            expect(res.success).toBe(false);
            expect(res.status).toBe(429);
        });

        it('should create a jar successfully', async () => {
            (getSession as any).mockResolvedValue({ user: { id: 'user1', email: 'test@example.com' } });
            (checkRateLimit as any).mockResolvedValue({ allowed: true });

            // Mock user finding
            prismaMock.user.findUnique.mockResolvedValue({ id: 'user1' } as any);

            // Mock count
            prismaMock.jarMember.count.mockResolvedValue(0);

            // Mock create
            const mockJar = { id: 'jar1', name: 'Test Jar', referenceCode: 'ABC-123' };
            prismaMock.jar.create.mockResolvedValue(mockJar as any);

            // Mock update active jar
            prismaMock.user.update.mockResolvedValue({} as any);

            const res = await createJar({ name: 'Test Jar' });

            if (!res.success) {
                expect(res.error).toBeUndefined();
            }

            expect(res.success).toBe(true);
            expect(res.data).toEqual(mockJar);
            expect(prismaMock.jar.create).toHaveBeenCalled();
        });

        it('should block creation if plan limit reached', async () => {
            (getSession as any).mockResolvedValue({ user: { id: 'user1' } });
            (checkRateLimit as any).mockResolvedValue({ allowed: true });
            prismaMock.user.findUnique.mockResolvedValue({ id: 'user1' } as any);
            // Mock that they already have 5 jars (equal to max)
            prismaMock.jarMember.count.mockResolvedValue(5);

            const res = await createJar({ name: 'Limit Jar' });
            expect(res.success).toBe(false);
            expect(res.error).toContain('Plan limit reached');
            expect(res.status).toBe(403);
        });
    });

    describe('updateJar', () => {
        it('should return 403 if user is not admin', async () => {
            (getSession as any).mockResolvedValue({ user: { id: 'user1' } });

            prismaMock.user.findUnique.mockResolvedValue({
                id: 'user1',
                memberships: [{ jarId: 'jar1', role: 'MEMBER' }] // Not Admin
            } as any);

            const res = await updateJar('jar1', { name: 'New Name' });
            expect(res.success).toBe(false);
            expect(res.status).toBe(403);
        });

        it('should update jar settings successfully', async () => {
            (getSession as any).mockResolvedValue({ user: { id: 'user1' } });

            prismaMock.user.findUnique.mockResolvedValue({
                id: 'user1',
                memberships: [{ jarId: 'jar1', role: 'ADMIN', jar: { isMysteryMode: false } }]
            } as any);

            prismaMock.jar.update.mockResolvedValue({ id: 'jar1', name: 'New Name' } as any);

            const res = await updateJar('jar1', { name: 'New Name' });
            expect(res.success).toBe(true);
            expect(prismaMock.jar.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'jar1' },
                data: { name: 'New Name' }
            }));
        });
    });

    describe('deleteJar', () => {
        it('should perform transactional delete', async () => {
            (getSession as any).mockResolvedValue({ user: { id: 'user1' } });

            prismaMock.jarMember.findFirst.mockResolvedValue({ role: 'OWNER' } as any);

            // Mock Transaction
            prismaMock.$transaction.mockImplementation(async (callback) => {
                if (typeof callback === 'function') {
                    return callback(prismaMock);
                }
                return callback;
            });

            const res = await deleteJar('jar1');
            if (!res.success) {
                // Force failure with message
                expect(res.error).toBeUndefined();
            }
            expect(res.success).toBe(true);
            expect(prismaMock.jar.delete).toHaveBeenCalledWith({ where: { id: 'jar1' } });
        });
    });
});
