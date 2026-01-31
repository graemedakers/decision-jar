
import { prismaMock } from '../../libs/prisma';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateApiKey, revokeApiKey } from '@/app/actions/developer';
import { getSession } from '@/lib/auth';

// Mock dependencies
vi.mock('@/lib/auth', () => ({ getSession: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

describe('Developer Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('generateApiKey', () => {
        it('should return unauthorized if no session', async () => {
            (getSession as any).mockResolvedValue(null);
            const result = await generateApiKey();
            expect(result.error).toBe('Unauthorized');
        });

        it('should return error if user already has an active key', async () => {
            (getSession as any).mockResolvedValue({ user: { id: 'user-1' } });
            prismaMock.apiKey.count.mockResolvedValue(1); // Already has key

            const result = await generateApiKey();
            expect(result.error).toContain('already have an active API key');
        });

        it('should create a new key for FREE tier', async () => {
            (getSession as any).mockResolvedValue({ user: { id: 'user-1' } });
            prismaMock.apiKey.count.mockResolvedValue(0);
            prismaMock.apiKey.create.mockResolvedValue({ id: 'key-1', key: 'sk_live_123', tier: 'FREE' } as any);

            const result = await generateApiKey('FREE');

            expect(result.success).toBe(true);
            expect(prismaMock.apiKey.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    userId: 'user-1',
                    tier: 'FREE',
                    monthlyLimit: 100
                    // isActive is default true in DB, not passed in create
                })
            }));
        });

        it('should create a new key for PRO tier with correct limits', async () => {
            (getSession as any).mockResolvedValue({ user: { id: 'user-1' } });
            prismaMock.apiKey.count.mockResolvedValue(0);
            prismaMock.apiKey.create.mockResolvedValue({ id: 'key-1', key: 'sk_live_123', tier: 'PRO' } as any);

            const result = await generateApiKey('PRO');

            expect(result.success).toBe(true);
            expect(prismaMock.apiKey.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    userId: 'user-1',
                    tier: 'PRO',
                    monthlyLimit: 5000
                })
            }));
        });
    });

    describe('revokeApiKey', () => {
        it('should return unauthorized if no session', async () => {
            (getSession as any).mockResolvedValue(null);
            const result = await revokeApiKey('key-1');
            expect(result.error).toBe('Unauthorized');
        });

        it('should return error if key not found or belongs to another user', async () => {
            (getSession as any).mockResolvedValue({ user: { id: 'user-1' } });
            // Case 1: Key not found
            prismaMock.apiKey.findUnique.mockResolvedValue(null);
            const result = await revokeApiKey('key-1');
            expect(result.error).toBe('Not found or unauthorized');

            // Case 2: Belongs to other
            prismaMock.apiKey.findUnique.mockResolvedValue({ id: 'key-1', userId: 'user-2' } as any);
            const result2 = await revokeApiKey('key-1');
            expect(result2.error).toBe('Not found or unauthorized');
        });

        it('should deactivate key if user matches', async () => {
            (getSession as any).mockResolvedValue({ user: { id: 'user-1' } });
            prismaMock.apiKey.findUnique.mockResolvedValue({ id: 'key-1', userId: 'user-1' } as any);
            prismaMock.apiKey.update.mockResolvedValue({ id: 'key-1', isActive: false } as any);

            const result = await revokeApiKey('key-1');

            expect(result.success).toBe(true);
            expect(prismaMock.apiKey.update).toHaveBeenCalledWith({
                where: { id: 'key-1' },
                data: { isActive: false }
            });
        });
    });
});
