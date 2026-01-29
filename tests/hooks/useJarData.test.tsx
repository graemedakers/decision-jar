import { renderHook, waitFor } from '@testing-library/react';
import { useJarData } from '@/hooks/dashboard/useJarData';
import { vi, describe, it, expect } from 'vitest';

// Mock useSession (NextAuth)
vi.mock('next-auth/react', () => ({
    useSession: () => ({
        data: {
            user: { id: 'test-user-id', name: 'Test User' }
        },
        status: 'authenticated'
    })
}));

// Mock internal hooks to isolate useJarData
vi.mock('@/hooks/useUser', () => ({
    useUser: () => ({
        userData: { id: 'test-user', jarTopic: 'General', activeJarId: 'test-jar-id' },
        isLoading: false,
        isPremium: true,
        refreshUser: vi.fn(),
        xp: 100,
        level: 2,
        achievements: [],
        hasPaid: true,
        coupleCreatedAt: '2023-01-01',
        isTrialEligible: false,
        currentStreak: 5,
        longestStreak: 10
    })
}));

vi.mock('@/hooks/useIdeas', () => ({
    useIdeas: () => ({
        ideas: [{ id: '1', description: 'Idea 1' }, { id: '2', description: 'Idea 2' }],
        isLoading: false,
        isFetching: false,
        fetchIdeas: vi.fn()
    })
}));

vi.mock('@/hooks/useFavorites', () => ({
    useFavorites: () => ({
        favoritesCount: 3,
        fetchFavorites: vi.fn()
    })
}));

vi.mock('@/hooks/useTrialStatus', () => ({
    useTrialStatus: () => ({
        shouldShowTrialModal: false,
        dismissTrialModal: vi.fn()
    })
}));

vi.mock('@/hooks/features/usePWAHandler', () => ({
    usePWAHandler: vi.fn()
}));

vi.mock('@/hooks/features/useUrlSync', () => ({
    useUrlSync: vi.fn()
}));

describe('useJarData', () => {
    it('should fetch jar data successfully', async () => {
        // Mock openModal function
        const openModal = vi.fn();
        const { result } = renderHook(() => useJarData(openModal));

        // Wait for data
        await waitFor(() => {
            expect(result.current.ideas).toBeDefined();
        });

        expect(result.current.ideas).toHaveLength(2);
        expect(result.current.userData.id).toBe('test-user');
    });
});
