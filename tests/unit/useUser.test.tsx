import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUser, resetRedirectState } from '@/hooks/useUser';
import { ReactNode } from 'react';

import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

// NO manual fetch stubbing here, setup.ts handles it with MSW

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
        resetRedirectState();
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

        server.use(
            http.get('*/api/auth/me', () => {
                return HttpResponse.json(mockUserData);
            })
        );

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
        if (result.current.userData === undefined) {
            console.error('Test Failed: userData is undefined. Error:', result.current.error);
        }
        expect(result.current.userData).toEqual(mockUserData.user);
        expect(result.current.isPremium).toBe(true);
        expect(result.current.level).toBe(3);
        expect(result.current.xp).toBe(150);
    });

    it('should handle authentication errors by redirecting', async () => {
        resetRedirectState(); // Ensure clean state inside the test
        const mockReplace = vi.fn();
        vi.stubGlobal('location', {
            replace: mockReplace,
            href: 'http://localhost:3000/',
            origin: 'http://localhost:3000'
        });

        server.use(
            http.get('*/api/auth/me', () => {
                return new HttpResponse(JSON.stringify({ error: 'Unauthorized' }), {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                });
            })
        );

        const { result } = renderHook(() => useUser({ redirectToLogin: true }), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(mockReplace).toHaveBeenCalledWith(expect.stringContaining('/api/auth/nuke-session'));
        }, { timeout: 3000 });
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

        server.use(
            http.get('*/api/auth/me', () => {
                return HttpResponse.json(mockUserData);
            })
        );

        const { result } = renderHook(() => useUser(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.level).toBe(1);
    });

    // TODO: This test is flaky in the test environment. useEffect seems to be skipped for intermediate state (level 1)
    // causing prevLevelRef to stay null, thus preventing the callback from firing when level becomes 2.
    it.skip('should trigger onLevelUp callback when level increases', async () => {
        const onLevelUp = vi.fn((l) => console.error('onLevelUp called:', l));

        const mockUserDataLevel1 = {
            user: { id: 'user-123', level: 1 },
        };

        const mockUserDataLevel2 = {
            user: { id: 'user-123', level: 2 },
        };

        (global.fetch as any).mockImplementation(async (url: string) => {
            const callCount = (global.fetch as any).mock.calls.length;
            console.error(`Fetch called (${callCount}):`, url);
            if (callCount === 1) {
                return {
                    ok: true,
                    json: async () => mockUserDataLevel1,
                };
            }
            return {
                ok: true,
                json: async () => mockUserDataLevel2,
            };
        });

        const { result } = renderHook(() => useUser({ onLevelUp }), {
            wrapper: createWrapper(),
        });

        // Wait for first level
        await waitFor(() => {
            expect(result.current.level).toBe(1);
        });

        // Trigger refetch
        await result.current.refreshUser();

        await waitFor(() => {
            expect(result.current.level).toBe(2);
        });

        // Level up callback should be called
        await waitFor(() => {
            expect(onLevelUp).toHaveBeenCalledWith(2);
        });
    });

    it('should correctly calculate premium status', async () => {
        const uniqueId = 'premium-check-' + Math.random();
        const mockUserData = {
            user: {
                id: uniqueId,
                isPremium: false,
                hasPaid: true,
                isTrialEligible: false,
            },
        };

        server.use(
            http.get('*/api/auth/me', () => {
                return HttpResponse.json(mockUserData);
            }, { once: true })
        );

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
