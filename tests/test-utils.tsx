import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactElement, ReactNode } from 'react';

// Create a custom render function with providers
export function renderWithProviders(
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    function Wrapper({ children }: { children: ReactNode }) {
        return (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        );
    }

    return render(ui, { wrapper: Wrapper, ...options });
}

// Mock user data for tests
export const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    activeJarId: 'test-jar-id',
    memberships: [
        {
            id: 'membership-1',
            jarId: 'test-jar-id',
            userId: 'test-user-id',
            role: 'ADMIN',
            status: 'ACTIVE',
            jar: {
                id: 'test-jar-id',
                name: 'Test Jar',
                type: 'SOCIAL',
                topic: 'General',
            },
        },
    ],
    xp: 100,
    level: 2,
    isPremium: false,
    hasPaid: false,
    isTrialEligible: true,
};

// Mock idea data
export const mockIdea = {
    id: 'test-idea-id',
    description: 'Test Idea Description',
    indoor: true,
    duration: 1,
    activityLevel: 'MEDIUM',
    cost: '$',
    timeOfDay: 'EVENING',
    category: 'ACTIVITY',
    jarId: 'test-jar-id',
    createdById: 'test-user-id',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    selectedAt: null,
    status: 'APPROVED',
    isSurprise: false,
    isPrivate: false,
    requiresTravel: false,
    weather: 'ANY',
    photoUrls: [],
};

// Wait for async updates
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Re-export everything from testing library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
