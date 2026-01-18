
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notifyJarMembers } from '@/lib/notifications';
import webpush from 'web-push';

export const dynamic = 'force-dynamic';

/**
 * Consolidated Notifications Cron Job
 * Handles:
 * 1. Memory Reminders (24h after selection)
 * 2. Streak Risk Reminders (Jars inactive today with active streaks)
 */
export async function GET(req: NextRequest) {
    // Basic security check (Cron Secret)
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results = {
        memoryReminders: { processed: 0, sent: 0 },
        streakReminders: { processed: 0, sent: 0 },
        errors: [] as string[]
    };

    try {
        // --- 1. MEMORY REMINDERS ---
        const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
        const ideasToRemind = await prisma.idea.findMany({
            where: {
                selectedAt: { lt: cutoffDate },
                memoryReminderSent: false,
                rating: null,
                notes: null,
                status: 'APPROVED'
            },
            include: { jar: true },
            take: 50
        });

        results.memoryReminders.processed = ideasToRemind.length;

        if (ideasToRemind.length > 0) {
            const memoryResults = await Promise.allSettled(ideasToRemind.map(async (idea) => {
                await notifyJarMembers(idea.jarId, null, {
                    title: 'How was it?',
                    body: `You spun "${idea.description}" yesterday. Tap to save the memory!`,
                    url: `/dashboard?action=capture&ideaId=${idea.id}`,
                    // @ts-ignore
                    icon: '/icons/icon-192x192.png'
                });

                await prisma.idea.update({
                    where: { id: idea.id },
                    data: { memoryReminderSent: true }
                });
                return idea.id;
            }));
            results.memoryReminders.sent = memoryResults.filter(r => r.status === 'fulfilled').length;
        }

        // --- 2. STREAK REMINDERS ---
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const inactiveJars = await prisma.jar.findMany({
            where: {
                currentStreak: { gt: 0 },
                OR: [
                    { lastActiveDate: { lt: today } },
                    { lastActiveDate: null }
                ]
            },
            include: {
                members: {
                    include: {
                        user: {
                            include: { pushSubscriptions: true }
                        }
                    }
                }
            },
            take: 50
        });

        results.streakReminders.processed = inactiveJars.length;

        for (const jar of inactiveJars) {
            for (const member of jar.members) {
                const user = member.user;
                if (user.notifyStreakReminder === false) continue;

                for (const subscription of user.pushSubscriptions) {
                    try {
                        await webpush.sendNotification(
                            {
                                endpoint: subscription.endpoint,
                                keys: {
                                    p256dh: subscription.p256dh,
                                    auth: subscription.auth
                                }
                            },
                            JSON.stringify({
                                title: `🔥 ${jar.currentStreak}-day streak at risk!`,
                                body: "You haven't been active today. Keep your streak alive!",
                                icon: '/icon-192.png',
                                badge: '/icon-192.png',
                                url: '/dashboard',
                                tag: 'streak-reminder',
                                requireInteraction: false
                            })
                        );
                        results.streakReminders.sent++;
                    } catch (error: any) {
                        results.errors.push(`Streak error for User ${user.id}: ${error.message}`);
                        if (error.statusCode === 410 || error.statusCode === 404) {
                            await prisma.pushSubscription.delete({
                                where: { id: subscription.id }
                            }).catch(() => { });
                        }
                    }
                }
            }
        }

        return NextResponse.json({
            success: true,
            results
        });

    } catch (error: any) {
        console.error("Consolidated Cron Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
