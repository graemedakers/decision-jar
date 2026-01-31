'use server';

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function generateApiKey(tier: string = 'FREE') {
    const session = await getSession();
    if (!session?.user?.id) {
        return { error: 'Unauthorized' };
    }

    try {
        // Enforce Limits: Only 1 active key per user for MVP
        const existingKeys = await prisma.apiKey.count({
            where: {
                userId: session.user.id,
                isActive: true
            }
        });

        if (existingKeys >= 1) {
            return { error: 'You already have an active API key. Please revoke it before generating a new one.' };
        }

        const limits: Record<string, number> = {
            'FREE': 100,
            'STARTER': 1000,
            'PRO': 5000,
            'ENTERPRISE': -1 // Unlimited
        };

        const key = `sk_live_${crypto.randomUUID().replace(/-/g, '')}`;

        await prisma.apiKey.create({
            data: {
                key: key,
                secretHash: 'legacy_mode', // Placeholder as we use 'key' as the secret for now
                tier: tier,
                monthlyLimit: limits[tier] || 100,
                userId: session.user.id,
                resetAt: new Date(new Date().setMonth(new Date().getMonth() + 1))
            }
        });

        revalidatePath('/developers');
        return { success: true, key };

    } catch (error: any) {
        console.error('Failed to generate key:', error);
        return { error: error.message };
    }
}

export async function revokeApiKey(keyId: string) {
    const session = await getSession();
    if (!session?.user?.id) {
        return { error: 'Unauthorized' };
    }

    try {
        // Verify ownership
        const key = await prisma.apiKey.findUnique({
            where: { id: keyId }
        });

        if (!key || key.userId !== session.user.id) {
            return { error: 'Not found or unauthorized' };
        }

        await prisma.apiKey.update({
            where: { id: keyId },
            data: { isActive: false }
        });

        revalidatePath('/developers');
        return { success: true };

    } catch (error: any) {
        return { error: error.message };
    }
}
