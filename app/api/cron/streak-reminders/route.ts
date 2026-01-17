import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import webpush from 'web-push';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    // Basic security check (Cron Secret)
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find jars that:
        // 1. Have not been active today (lastActiveDate is NOT today)
        // 2. Have an active streak (currentStreak > 0)
        const inactiveJars = await prisma.jar.findMany({
            where: {
                currentStreak: {
                    gt: 0
                },
                OR: [
                    {
                        lastActiveDate: {
                            lt: today
                        }
                    },
                    {
                        lastActiveDate: null
                    }
                ]
            },
            include: {
                members: {
                    include: {
                        user: {
                            include: {
                                pushSubscriptions: true
                            }
                        }
                    }
                }
            },
            take: 100 // Process in batches
        });

        console.log(`Found ${inactiveJars.length} jars with inactive streaks`);

        let notificationsSent = 0;
        const errors: string[] = [];

        for (const jar of inactiveJars) {
            for (const member of jar.members) {
                const user = member.user;

                // Check user preference
                if (user.notifyStreakReminder === false) {
                    console.log(`User ${user.id} has disabled streak reminders`);
                    continue;
                }

                // Send notification to all subscribed devices
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

                        notificationsSent++;
                    } catch (error: any) {
                        console.error(`Failed to send streak reminder to user ${user.id}:`, error);
                        errors.push(`User ${user.id}: ${error.message}`);

                        // If subscription is expired/invalid, remove it
                        if (error.statusCode === 410 || error.statusCode === 404) {
                            await prisma.pushSubscription.delete({
                                where: { id: subscription.id }
                            }).catch(err => console.error("Failed to delete subscription:", err));
                        }
                    }
                }
            }
        }

        return NextResponse.json({
            success: true,
            jarsProcessed: inactiveJars.length,
            notificationsSent: notificationsSent,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error: any) {
        console.error("Streak Reminder Cron Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
