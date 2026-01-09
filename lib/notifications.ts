import { prisma } from '@/lib/prisma';
import webpush from 'web-push';

// Ensure VAPID keys are set
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        process.env.VAPID_SUBJECT || 'mailto:admin@decisionjar.com',
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

interface NotificationPayload {
    title: string;
    body: string;
    url?: string;
    icon?: string;
}

export async function sendPushNotification(userId: string, payload: NotificationPayload) {
    try {
        // 1. Fetch subscriptions for the user
        // @ts-ignore - Schema might be missing from generated client types in this environment
        const subscriptions = await prisma.pushSubscription.findMany({
            where: { userId }
        });

        if (!subscriptions || !subscriptions.length) return { sent: 0, failed: 0 };

        // 2. Prepare payload
        const data = JSON.stringify({
            title: payload.title,
            body: payload.body,
            url: payload.url || '/',
            icon: payload.icon || '/icon.png'
        });

        // 3. Send notifications
        const results = await Promise.allSettled(
            subscriptions.map(async (sub: any) => {
                try {
                    await webpush.sendNotification({
                        endpoint: sub.endpoint,
                        keys: {
                            p256dh: sub.p256dh,
                            auth: sub.auth
                        }
                    }, data);
                } catch (error: any) {
                    if (error.statusCode === 410 || error.statusCode === 404) {
                        try {
                            // Subscription expired/gone, clean up
                            // @ts-ignore
                            await prisma.pushSubscription.delete({ where: { id: sub.id } });
                        } catch (e) {
                            // Ignore cleanup errors
                        }
                    }
                    throw error;
                }
            })
        );

        const sent = results.filter((r: PromiseSettledResult<any>) => r.status === 'fulfilled').length;
        const failed = results.filter((r: PromiseSettledResult<any>) => r.status === 'rejected').length;

        return { sent, failed };
    } catch (error) {
        console.error("Error sending push notification to user " + userId, error);
        return { sent: 0, failed: 0 };
    }
}

export async function notifyJarMembers(jarId: string, excludeUserId: string | null, payload: NotificationPayload) {
    try {
        // Find active members of the jar
        const members = await prisma.jarMember.findMany({
            where: {
                jarId,
                userId: excludeUserId ? { not: excludeUserId } : undefined,
                status: 'ACTIVE'
            },
            select: { userId: true }
        });

        const promises = members.map(member =>
            sendPushNotification(member.userId, payload)
        );

        await Promise.all(promises);
    } catch (error) {
        console.error("Error notifying jar members for " + jarId, error);
    }
}
