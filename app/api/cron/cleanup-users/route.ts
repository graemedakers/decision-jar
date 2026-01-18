
import { prisma } from '@/lib/prisma';
import { deleteUserCompletely } from '@/lib/user-admin';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    // 1. Verify Authorization (Vercel Cron Secret)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        console.log('[CRON] Starting unverified user cleanup...');

        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

        const usersToDelete = await prisma.user.findMany({
            where: {
                emailVerified: null,
                createdAt: {
                    lt: twoWeeksAgo
                },
                isLifetimePro: false,
                OR: [
                    { subscriptionStatus: null },
                    { subscriptionStatus: { notIn: ['active', 'trialing', 'past_due'] } }
                ]
            },
            select: {
                id: true,
                email: true
            }
        });

        console.log(`[CRON] Found ${usersToDelete.length} unverified users for cleanup.`);

        let successCount = 0;
        let failCount = 0;

        for (const user of usersToDelete) {
            try {
                await prisma.$transaction(async (tx) => {
                    await deleteUserCompletely(tx, user.id);
                });
                successCount++;
            } catch (error) {
                console.error(`[CRON] Failed to delete user ${user.id}:`, error);
                failCount++;
            }
        }

        return NextResponse.json({
            processed: usersToDelete.length,
            success: successCount,
            failed: failCount,
            message: 'Cleanup completed successfully'
        });

    } catch (error: any) {
        console.error('[CRON] Fatal cleanup error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
