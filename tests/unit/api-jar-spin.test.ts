import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from '@/app/api/jar/spin/route';
import { NextRequest } from 'next/server';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
    prisma: {
        idea: {
            findMany: vi.fn(),
            update: vi.fn(),
        },
        user: {
            findUnique: vi.fn(),
        },
    },
}));

// Mock auth
vi.mock('@/lib/auth', () => ({
    getSession: vi.fn(),
}));

// Mock gamification
vi.mock('@/lib/gamification', () => ({
    awardPoints: vi.fn(),
}));

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { awardPoints } from '@/lib/gamification';

describe('/api/jar/spin - Jar Spinning Logic', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should select a random idea from available ones', async () => {
        const mockSession = {
            user: {
                id: 'user-123',
                email: 'test@example.com',
            },
        };

        const mockUser = {
            id: 'user-123',
            activeJarId: 'jar-456',
        };

        const mockIdeas = [
            {
                id: 'idea-1',
                description: 'Go hiking',
                selectedAt: null,
                status: 'APPROVED',
            },
            {
                id: 'idea-2',
                description: 'Movie night',
                selectedAt: null,
                status: 'APPROVED',
            },
            {
                id: 'idea-3',
                description: 'Cooking class',
                selectedAt: null,
                status: 'APPROVED',
            },
        ];

        (getSession as any).mockResolvedValue(mockSession);
        (prisma.user.findUnique as any).mockResolvedValue(mockUser);
        (prisma.idea.findMany as any).mockResolvedValue(mockIdeas);
        (prisma.idea.update as any).mockImplementation(({ where }) => {
            const idea = mockIdeas.find(i => i.id === where.id);
            return {
                ...idea,
                selectedAt: new Date(),
            };
        });

        const request = new NextRequest('http://localhost:3000/api/jar/spin', {
            method: 'POST',
            body: JSON.stringify({ filters: {} }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.idea).toBeDefined();
        expect(['idea-1', 'idea-2', 'idea-3']).toContain(data.idea.id);
        expect(data.idea.selectedAt).toBeDefined();
    });

    it('should apply duration filters correctly', async () => {
        const mockSession = { user: { id: 'user-123', email: 'test@example.com' } };
        const mockUser = { id: 'user-123', activeJarId: 'jar-456' };

        const mockIdeas = [
            { id: 'idea-1', description: 'Quick task', duration: 0.5, selectedAt: null, status: 'APPROVED' },
            { id: 'idea-2', description: 'Long activity', duration: 3, selectedAt: null, status: 'APPROVED' },
        ];

        (getSession as any).mockResolvedValue(mockSession);
        (prisma.user.findUnique as any).mockResolvedValue(mockUser);
        (prisma.idea.findMany as any).mockResolvedValue(mockIdeas);
        (prisma.idea.update as any).mockResolvedValue({ ...mockIdeas[0], selectedAt: new Date() });

        const request = new NextRequest('http://localhost:3000/api/jar/spin', {
            method: 'POST',
            body: JSON.stringify({
                filters: {
                    maxDuration: 1,
                },
            }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        // Should only return idea-1 (duration 0.5 <= 1)
        expect(data.idea.duration).toBeLessThanOrEqual(1);
    });

    it('should return error when no active jar', async () => {
        const mockSession = { user: { id: 'user-123', email: 'test@example.com' } };
        const mockUser = { id: 'user-123', activeJarId: null };

        (getSession as any).mockResolvedValue(mockSession);
        (prisma.user.findUnique as any).mockResolvedValue(mockUser);

        const request = new NextRequest('http://localhost:3000/api/jar/spin', {
            method: 'POST',
            body: JSON.stringify({ filters: {} }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toContain('No active jar');
    });

    it('should return error when no available ideas', async () => {
        const mockSession = { user: { id: 'user-123', email: 'test@example.com' } };
        const mockUser = { id: 'user-123', activeJarId: 'jar-456' };

        (getSession as any).mockResolvedValue(mockSession);
        (prisma.user.findUnique as any).mockResolvedValue(mockUser);
        (prisma.idea.findMany as any).mockResolvedValue([]);

        const request = new NextRequest('http://localhost:3000/api/jar/spin', {
            method: 'POST',
            body: JSON.stringify({ filters: {} }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.success).toBe(false);
        expect(data.error).toContain('No available ideas');
    });

    it('should award gamification points on successful spin', async () => {
        const mockSession = { user: { id: 'user-123', email: 'test@example.com' } };
        const mockUser = { id: 'user-123', activeJarId: 'jar-456' };
        const mockIdeas = [
            { id: 'idea-1', description: 'Test', selectedAt: null, status: 'APPROVED' },
        ];

        (getSession as any).mockResolvedValue(mockSession);
        (prisma.user.findUnique as any).mockResolvedValue(mockUser);
        (prisma.idea.findMany as any).mockResolvedValue(mockIdeas);
        (prisma.idea.update as any).mockResolvedValue({ ...mockIdeas[0], selectedAt: new Date() });

        const request = new NextRequest('http://localhost:3000/api/jar/spin', {
            method: 'POST',
            body: JSON.stringify({ filters: {} }),
        });

        await POST(request);

        // Should award points for spinning
        expect(awardPoints).toHaveBeenCalledWith('user-123', expect.any(String));
    });

    it('should exclude already selected ideas', async () => {
        const mockSession = { user: { id: 'user-123', email: 'test@example.com' } };
        const mockUser = { id: 'user-123', activeJarId: 'jar-456' };

        const mockIdeas = [
            { id: 'idea-1', description: 'Available', selectedAt: null, status: 'APPROVED' },
        ];

        (getSession as any).mockResolvedValue(mockSession);
        (prisma.user.findUnique as any).mockResolvedValue(mockUser);
        (prisma.idea.findMany as any).mockResolvedValue(mockIdeas);

        const request = new NextRequest('http://localhost:3000/api/jar/spin', {
            method: 'POST',
            body: JSON.stringify({ filters: {} }),
        });

        await POST(request);

        // Verify that findMany was called with selectedAt: null filter
        expect(prisma.idea.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    selectedAt: null,
                }),
            })
        );
    });
});
