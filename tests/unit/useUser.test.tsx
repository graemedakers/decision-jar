import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUser } from '@/hooks/useUser';
import { ReactNode } from 'react';

// Mock fetch globally
global.fetch = vi.fn();

function createWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });
    return ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient} > {children} </QueryClientProvider>
    );
}

describe('useUser Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch user data successfully', async () => {
        const mockUserData = {
            user: {
                id: 'user-123',
                email: 'test@example.com',
                name: 'Test User',
                activeJarId: 'jar-456',
                xp: 150,
                level: 3,
                isPremium: true,
                hasPaid: true,
                memberships: [
                    {
                        jarId: 'jar-456',
                        role: 'ADMIN',
                        jar: { name: 'My Jar', type: 'SOCIAL' },
                    },
                ],
            },
        };

        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => mockUserData,
        });

        const { result } = renderHook(() => useUser(), {
            wrapper: createWrapper(),
        });

        // Initially loading
        expect(result.current.isLoading).toBe(true);

        // Wait for data to load
        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        // Check user data
        expect(result.current.userData).toEqual(mockUserData.user);
        expect(result.current.isPremium).toBe(true);
        expect(result.current.level).toBe(3);
        expect(result.current.xp).toBe(150);
    });

    it('should handle authentication errors by redirecting', async () => {
        const mockWindowLocation = { href: '' };
        delete (window as any).location;
        window.location = mockWindowLocation as any;

        (global.fetch as any).mockResolvedValueOnce({
            ok: false,
            status: 401,
            json: async () => ({ error: 'Unauthorized' }),
        });

        const { result } = renderHook(() => useUser({ redirectToLogin: true }), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(window.location.href).toBe('/api/auth/nuke-session');
        });
    });

    it('should return default level of 1 when undefined', async () => {
        const mockUserData = {
            user: {
                id: 'user-123',
                email: 'test@example.com',
                name: 'Test User',
                // level is intentionally missing
            },
        };

        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => mockUserData,
        });

        const { result } = renderHook(() => useUser(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.level).toBe(1);
    });

    it('should trigger onLevelUp callback when level increases', async () => {
        const onLevelUp = vi.fn();

        const mockUserDataLevel1 = {
            user: { id: 'user-123', level: 1 },
        };

        const mockUserDataLevel2 = {
            user: { id: 'user-123', level: 2 },
        };

        (global.fetch as any)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockUserDataLevel1,
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockUserDataLevel2,
            });

        const { result, rerender } = renderHook(() => useUser({ onLevelUp }), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.level).toBe(1);
        });

        // Trigger refetch
        result.current.refreshUser();

        await waitFor(() => {
            expect(result.current.level).toBe(2);
        });

        // Level up callback should be called
        await waitFor(() => {
            expect(onLevelUp).toHaveBeenCalledWith(2);
        });
    });

    it('should correctly calculate premium status', async () => {
        const mockUserData = {
            user: {
                id: 'user-123',
                isPremium: false,
                hasPaid: true,
                isTrialEligible: false,
            },
        };

        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => mockUserData,
        });

        const { result } = renderHook(() => useUser(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.isPremium).toBe(false);
        expect(result.current.hasPaid).toBe(true);
        expect(result.current.isTrialEligible).toBe(false);
    });
});
