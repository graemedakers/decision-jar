import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from '@/app/api/stripe/webhook/route';
import { NextRequest } from 'next/server';
import Stripe from 'stripe';

// Mock dependencies
vi.mock('@/lib/prisma', () => {
    const mockUser = {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
        create: vi.fn(),
    };
    const mockJar = {
        create: vi.fn(),
    };
    const mockJarMember = {
        create: vi.fn(),
    };
    const mockPrisma = {
        user: mockUser,
        jar: mockJar,
        jarMember: mockJarMember,
        $transaction: vi.fn((cb) => cb({ user: mockUser, jar: mockJar, jarMember: mockJarMember })),
    };
    return { prisma: mockPrisma };
});

vi.mock('@/lib/stripe', () => ({
    stripe: {
        webhooks: {
            constructEvent: vi.fn(),
        },
    },
}));

vi.mock('next/headers', () => ({
    headers: () => ({
        get: (key: string) => {
            if (key === 'stripe-signature' || key === 'Stripe-Signature') return 'test_signature';
            return null;
        }
    })
}));

import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

describe('/api/stripe/webhook - Payment Processing', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should handle successful checkout session', async () => {
        const mockEvent: Stripe.Event = {
            id: 'evt_test',
            object: 'event',
            type: 'checkout.session.completed',
            data: {
                object: {
                    id: 'cs_test',
                    customer: 'cus_test',
                    customer_email: 'test@example.com',
                    subscription: 'sub_test',
                    metadata: {
                        userId: 'user-123',
                        type: 'SUBSCRIPTION_UPGRADE',
                    },
                } as any,
            },
        } as any;

        (stripe.webhooks.constructEvent as any).mockReturnValue(mockEvent);
        (prisma.user.update as any).mockResolvedValue({
            id: 'user-123',
            email: 'test@example.com',
            stripeCustomerId: 'cus_test',
        });

        const request = new NextRequest('http://localhost:3000/api/stripe/webhook', {
            method: 'POST',
            headers: {
                'stripe-signature': 'test_signature',
            },
            body: JSON.stringify(mockEvent),
        });

        const response = await POST(request);

        expect(response.status).toBe(200);
        expect(prisma.user.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 'user-123' },
                data: expect.objectContaining({
                    stripeCustomerId: 'cus_test',
                    stripeSubscriptionId: 'sub_test',
                }),
            })
        );
    });

    it('should handle subscription updates', async () => {
        const mockEvent: Stripe.Event = {
            id: 'evt_test',
            object: 'event',
            type: 'customer.subscription.updated',
            data: {
                object: {
                    id: 'sub_test',
                    status: 'active',
                    current_period_end: 1234567890,
                } as any,
            },
        } as any;

        (stripe.webhooks.constructEvent as any).mockReturnValue(mockEvent);
        (prisma.user.updateMany as any).mockResolvedValue({ count: 1 });

        const request = new NextRequest('http://localhost:3000/api/stripe/webhook', {
            method: 'POST',
            headers: {
                'stripe-signature': 'test_signature',
            },
            body: JSON.stringify(mockEvent),
        });

        const response = await POST(request);

        expect(response.status).toBe(200);
        expect(prisma.user.updateMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { stripeSubscriptionId: 'sub_test' },
                data: expect.objectContaining({
                    subscriptionStatus: 'active',
                }),
            })
        );
    });

    it('should handle subscription cancellation', async () => {
        const mockEvent: Stripe.Event = {
            id: 'evt_test',
            object: 'event',
            type: 'customer.subscription.deleted',
            data: {
                object: {
                    id: 'sub_test',
                } as any,
            },
        } as any;

        (stripe.webhooks.constructEvent as any).mockReturnValue(mockEvent);
        (prisma.user.updateMany as any).mockResolvedValue({ count: 1 });

        const request = new NextRequest('http://localhost:3000/api/stripe/webhook', {
            method: 'POST',
            headers: {
                'stripe-signature': 'test_signature',
            },
            body: JSON.stringify(mockEvent),
        });

        const response = await POST(request);

        expect(response.status).toBe(200);
        expect(prisma.user.updateMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { stripeSubscriptionId: 'sub_test' },
                data: expect.objectContaining({
                    subscriptionStatus: 'canceled',
                    subscriptionEndsAt: expect.any(Date),
                }),
            })
        );
    });

    it('should reject invalid webhook signatures', async () => {
        (stripe.webhooks.constructEvent as any).mockImplementation(() => {
            throw new Error('Invalid signature');
        });

        const request = new NextRequest('http://localhost:3000/api/stripe/webhook', {
            method: 'POST',
            headers: {
                'stripe-signature': 'invalid_signature',
            },
            body: JSON.stringify({}),
        });

        const response = await POST(request);

        expect(response.status).toBe(400);
    });

    it('should create new user for checkout without userId metadata', async () => {
        const mockEvent: Stripe.Event = {
            id: 'evt_test',
            object: 'event',
            type: 'checkout.session.completed',
            data: {
                object: {
                    id: 'cs_test',
                    customer: 'cus_test',
                    customer_email: 'newuser@example.com',
                    subscription: 'sub_test',
                    metadata: {
                        type: 'NEW_COUPLE_SIGNUP',
                        name: 'New User',
                        email: 'newuser@example.com',
                        passwordHash: 'hashed_password',
                    },
                } as any,
            },
        } as any;

        (stripe.webhooks.constructEvent as any).mockReturnValue(mockEvent);
        (prisma.user.findFirst as any).mockResolvedValue(null); // User doesn't exist
        (prisma.jar.create as any).mockResolvedValue({ id: 'jar-new' });
        (prisma.user.create as any).mockResolvedValue({
            id: 'user-new',
            email: 'newuser@example.com',
        });

        const request = new NextRequest('http://localhost:3000/api/stripe/webhook', {
            method: 'POST',
            headers: {
                'stripe-signature': 'test_signature',
            },
            body: JSON.stringify(mockEvent),
        });

        const response = await POST(request);

        expect(response.status).toBe(200);
        expect(prisma.jar.create).toHaveBeenCalled();
        expect(prisma.user.create).toHaveBeenCalled();
    });

    it('should handle past_due subscription status', async () => {
        const mockEvent: Stripe.Event = {
            id: 'evt_test',
            object: 'event',
            type: 'customer.subscription.updated',
            data: {
                object: {
                    id: 'sub_test',
                    status: 'past_due',
                } as any,
            },
        } as any;

        (stripe.webhooks.constructEvent as any).mockReturnValue(mockEvent);
        (prisma.user.updateMany as any).mockResolvedValue({ count: 1 });
        (prisma.user.findFirst as any).mockResolvedValue({
            id: 'user-123',
            email: 'test@example.com',
            name: 'Test User',
        });

        const request = new NextRequest('http://localhost:3000/api/stripe/webhook', {
            method: 'POST',
            headers: {
                'stripe-signature': 'test_signature',
            },
            body: JSON.stringify(mockEvent),
        });

        const response = await POST(request);

        expect(response.status).toBe(200);
        expect(prisma.user.updateMany).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    subscriptionStatus: 'past_due',
                }),
            })
        );
    });
});
