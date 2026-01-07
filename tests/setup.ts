import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
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
