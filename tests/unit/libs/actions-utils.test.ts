
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkActionAuth } from '@/lib/actions-utils';
import { getSession } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
    getSession: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
    checkRateLimit: vi.fn(),
}));

describe('checkActionAuth', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 401 if no session exists', async () => {
        (getSession as any).mockResolvedValue(null);

        const result = await checkActionAuth();

        expect(result.authorized).toBe(false);
        if (!result.authorized) {
            expect(result.status).toBe(401);
            expect(result.error).toBe('Unauthorized');
        }
    });

    it('should return 401 if session has no user ID', async () => {
        (getSession as any).mockResolvedValue({ user: {} });

        const result = await checkActionAuth();

        expect(result.authorized).toBe(false);
        if (!result.authorized) {
            expect(result.status).toBe(401);
        }
    });

    it('should return 429 if rate limit is exceeded', async () => {
        (getSession as any).mockResolvedValue({ user: { id: 'user1', email: 'test@example.com' } });
        (checkRateLimit as any).mockResolvedValue({ allowed: false });

        const result = await checkActionAuth();

        expect(result.authorized).toBe(false);
        if (!result.authorized) {
            expect(result.status).toBe(429);
            expect(result.error).toBe('Too Many Requests');
        }
    });

    it('should return success and session data if authorized and within limits', async () => {
        const mockSession = { user: { id: 'user1', email: 'test@example.com' } };
        (getSession as any).mockResolvedValue(mockSession);
        (checkRateLimit as any).mockResolvedValue({ allowed: true });

        const result = await checkActionAuth();

        expect(result.authorized).toBe(true);
        if (result.authorized) {
            expect(result.session).toEqual(mockSession);
            expect(result.user).toEqual(mockSession.user);
        }
    });
});
