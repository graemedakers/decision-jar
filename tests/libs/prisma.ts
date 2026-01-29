
import { PrismaClient } from '@prisma/client';
import { beforeEach, vi } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';

// 1. Mock the module deep
// We export the mock so tests can import it directly to access methods
export const prismaMock = mockDeep<PrismaClient>();

// 2. Mock the default export of @/lib/prisma
// This assumes your app imports `prisma` from `@/lib/prisma`
vi.mock('@/lib/prisma', () => ({
    __esModule: true,
    prisma: prismaMock,
    default: prismaMock, // Handle default export if applicable
}));

// 3. Reset between tests to prevent state leakage
beforeEach(() => {
    mockReset(prismaMock);
});
