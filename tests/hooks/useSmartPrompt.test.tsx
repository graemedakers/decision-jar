import { renderHook, act, waitFor } from '@testing-library/react';
import { useSmartPrompt } from '@/hooks/features/useSmartPrompt';
import { vi, describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/tests/mocks/server';

// Mock Toast
vi.mock('@/lib/toast', () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
    showInfo: vi.fn()
}));

// Mock Utils (getCurrentLocation)
vi.mock('@/lib/utils', () => ({
    getCurrentLocation: vi.fn().mockResolvedValue('Test City, Country'),
    cn: (...inputs: any[]) => inputs.join(' ')
}));

// Mock Modal System
const mockOpenModal = vi.fn();
vi.mock('@/components/ModalProvider', () => ({
    useModalSystem: () => ({
        openModal: mockOpenModal,
        closeModal: vi.fn()
    }),
    ModelProvider: ({ children }: any) => children
}));

const mockFetchIdeas = vi.fn();
const mockUserData = {
    jarTopic: 'General',
    activeJarId: 'test-jar-id'
};

describe('useSmartPrompt', () => {
    it('should handle ADD_SINGLE intent (Magic Add)', async () => {
        // Mock Intent to be ADD_SINGLE with enrichment
        server.use(
            http.post('/api/intent/classify', () => {
                return HttpResponse.json({
                    intent: {
                        intentAction: 'ADD_SINGLE',
                        topic: 'Home Spa',
                        enrichment: {
                            category: 'WELLNESS',
                            cost: '$',
                            duration: 60,
                            vibe: 'Relaxed'
                        }
                    }
                });
            })
        );

        const { result } = renderHook(() => useSmartPrompt({
            userData: mockUserData,
            fetchIdeas: mockFetchIdeas
        }));

        await act(async () => {
            await result.current.handleSmartPrompt('have a home spa');
        });

        await waitFor(() => {
            expect(mockFetchIdeas).toHaveBeenCalled();
        });
    });

    it('should handle BULK_GENERATE intent', async () => {
        // Mock Intent to be BULK_GENERATE
        server.use(
            http.post('/api/intent/classify', () => {
                return HttpResponse.json({
                    intent: {
                        intentAction: 'BULK_GENERATE',
                        quantity: 5,
                        topic: 'Movies'
                    }
                });
            })
        );

        const { result } = renderHook(() => useSmartPrompt({
            userData: mockUserData,
            fetchIdeas: mockFetchIdeas
        }));

        await act(async () => {
            await result.current.handleSmartPrompt('5 movies');
        });

        // Should call bulk-generate (success mocked in handlers.ts)
        await waitFor(() => {
            expect(mockFetchIdeas).toHaveBeenCalled();
        });
    });
});
