import { describe, it, expect, vi } from 'vitest';
import { GET } from '@/app/api/user/gifts/route';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/next-auth-helper';
import { NextResponse } from 'next/server';

// Mock Next.js Server
vi.mock('next/server', () => {
    return {
        NextResponse: class {
            status: number;
            body: any;
            constructor(body: any, init?: any) {
                this.status = init?.status || 200;
                this.body = body;
            }
            static json(body: any, init?: any) {
                return {
                    status: init?.status || 200,
                    json: async () => body
                };
            }
        }
    };
});

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
    prisma: {
        giftToken: {
            findMany: vi.fn(),
        },
        jar: {
            findMany: vi.fn(),
        },
        user: {
            findUnique: vi.fn(),
        },
    },
}));

vi.mock('@/lib/next-auth-helper', () => ({
    auth: vi.fn(),
}));

describe('GET /api/user/gifts', () => {
    it('returns 401 if not authenticated', async () => {
        (auth as any).mockResolvedValue(null);
        // Mock request
        const req = {
            url: 'http://localhost/api/user/gifts'
        } as any;

        const res = await GET(req);
        // Since we mocked NextResponse, res.status captures the status
        expect(res.status).toBe(401);
    });

    it('returns gifts and stats for authenticated user', async () => {
        (auth as any).mockResolvedValue({
            user: { id: 'user-1' }
        });

        // Mock Sent Gifts
        (prisma.giftToken.findMany as any).mockResolvedValue([
            {
                token: 'token-1',
                createdAt: new Date(),
                acceptCount: 1,
                sourceJar: { name: 'My Jar' },
                acceptedBy: { name: 'Recipient' },
                expiresAt: new Date(Date.now() + 100000),
            }
        ]);

        // Mock Received Gifts
        (prisma.jar.findMany as any).mockResolvedValue([
            {
                id: 'jar-1',
                name: 'Gifted Jar',
                createdAt: new Date(),
                sourceGift: {
                    personalMessage: 'Enjoy!',
                    giftedBy: { name: 'Sender', image: 'url' }
                }
            }
        ]);

        // Mock User Stats
        (prisma.user.findUnique as any).mockResolvedValue({
            giftsThisMonth: 1,
            isLifetimePro: false,
            subscriptionStatus: 'active' // Pro user
        });

        const req = {
            url: 'http://localhost/api/user/gifts'
        } as any;

        const res = await GET(req);

        expect(res.status).toBe(200);
        const data = await res.json();

        expect(data.sent).toHaveLength(1);
        expect(data.received).toHaveLength(1);
        expect(data.stats).toBeDefined();
        expect(data.stats.sentCount).toBe(1);
        expect(data.stats.receivedCount).toBe(1);
        expect(data.stats.monthlySent).toBe(1);
        expect(data.stats.monthlyLimit).toBe(9999); // Pro limit
        expect(data.stats.canSendMore).toBe(true);
    });

    it('returns correct limit for free users', async () => {
        (auth as any).mockResolvedValue({ user: { id: 'user-2' } });
        (prisma.giftToken.findMany as any).mockResolvedValue([]);
        (prisma.jar.findMany as any).mockResolvedValue([]);
        (prisma.user.findUnique as any).mockResolvedValue({
            giftsThisMonth: 2,
            isLifetimePro: false,
            subscriptionStatus: null
        });

        const req = {
            url: 'http://localhost/api/user/gifts'
        } as any;

        const res = await GET(req);
        const data = await res.json();

        expect(data.stats.monthlyLimit).toBe(2);
        expect(data.stats.canSendMore).toBe(false);
    });
});
