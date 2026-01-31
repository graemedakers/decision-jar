import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi, beforeAll, afterAll } from 'vitest';
import React from 'react';

// Cleanup after each test
afterEach(() => {
    cleanup();
});

// Mock Next.js Router
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        refresh: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        prefetch: vi.fn(),
        pathname: '/',
        query: {},
        asPath: '/',
    }),
    useSearchParams: () => ({
        get: vi.fn(),
        toString: () => '',
    }),
    usePathname: () => '/',
}));

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
    useSession: () => ({ data: null, status: 'unauthenticated' }),
    SessionProvider: ({ children }: { children: React.ReactNode }) => children,
    signIn: vi.fn(),
    signOut: vi.fn(),
}));

// Mock next-auth for server-side
vi.mock('next-auth', () => {
    const mockAuth = () => ({
        handlers: { GET: vi.fn(), POST: vi.fn() },
        auth: vi.fn(),
        signIn: vi.fn(),
        signOut: vi.fn(),
    });
    return {
        __esModule: true,
        default: mockAuth,
        auth: vi.fn(), // export { auth } from "next-auth" is also common
    };
});

// Mock next/server is handled via vitest alias in vitest.config.ts


// Mock Capacitor
vi.mock('@capacitor/core', () => ({
    Capacitor: {
        getPlatform: () => 'web',
        isNativePlatform: () => false,
    },
}));

// Mock Framer Motion (for faster tests)
vi.mock('framer-motion', () => ({
    motion: new Proxy({}, {
        get: () => (props: any) => React.createElement('div', props),
    }),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// --- MSW Setup ---
import { server } from './mocks/server';


beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
