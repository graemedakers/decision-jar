import { prismaMock } from '../../libs/prisma';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createJar, updateJar, deleteJar } from '@/app/actions/jars';
import { checkActionAuth } from '@/lib/actions-utils';

// Mock dependencies
// Note: We don't mock getSession anymore because jars.ts doesn't use it directly.
vi.mock('@/lib/actions-utils', () => ({
    checkActionAuth: vi.fn(),
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
        vi.clearAllMocks();

        // Default safe mocks
        prismaMock.giftToken.findMany.mockResolvedValue([]);
        prismaMock.user.updateMany.mockResolvedValue({ count: 0 });
        prismaMock.jar.updateMany.mockResolvedValue({ count: 0 });
        prismaMock.giftToken.deleteMany.mockResolvedValue({ count: 0 });
        prismaMock.jar.delete.mockResolvedValue({} as any);
    });

    describe('createJar', () => {
        it('should return 401 if not authorized', async () => {
            (checkActionAuth as any).mockResolvedValue({ authorized: false, error: 'Unauthorized', status: 401 });
            const res = await createJar({ name: 'Test Jar' });
            expect(res.success).toBe(false);
            expect(res.status).toBe(401);
        });

        // Removed rate limit test because it's now internal to checkActionAuth, 
        // effectively tested by checkActionAuth failure mock above.

        it('should create a jar successfully', async () => {
            // Mock Auth Success
            (checkActionAuth as any).mockResolvedValue({
                authorized: true,
                user: { id: 'user1', email: 'test@example.com' },
                session: { user: { id: 'user1' } }
            });

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
            expect(res.data).toEqual(mockJar); // Updated expectation for data wrapper
            expect(prismaMock.jar.create).toHaveBeenCalled();
        });

        it('should block creation if plan limit reached', async () => {
            (checkActionAuth as any).mockResolvedValue({
                authorized: true,
                user: { id: 'user1' },
                session: { user: { id: 'user1' } }
            });

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
            (checkActionAuth as any).mockResolvedValue({
                authorized: true,
                user: { id: 'user1' },
                session: { user: { id: 'user1' } }
            });

            prismaMock.user.findUnique.mockResolvedValue({
                id: 'user1',
                memberships: [{ jarId: 'jar1', role: 'MEMBER' }] // Not Admin
            } as any);

            const res = await updateJar('jar1', { name: 'New Name' });
            expect(res.success).toBe(false);
            expect(res.status).toBe(403);
        });

        it('should update jar settings successfully', async () => {
            (checkActionAuth as any).mockResolvedValue({
                authorized: true,
                user: { id: 'user1' },
                session: { user: { id: 'user1' } }
            });

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
            (checkActionAuth as any).mockResolvedValue({
                authorized: true,
                user: { id: 'user1' },
                session: { user: { id: 'user1' } }
            });

            prismaMock.jarMember.findFirst.mockResolvedValue({ role: 'OWNER' } as any);

            // Mock Transaction
            prismaMock.$transaction.mockImplementation(async (callback) => {
                if (typeof callback === 'function') {
                    // @ts-ignore
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
