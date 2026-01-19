import { prisma } from '@/lib/prisma';
import webpush from 'web-push';

// Ensure VAPID keys are set
const vapidConfigured = !!(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
if (vapidConfigured) {
    webpush.setVapidDetails(
        process.env.VAPID_SUBJECT || 'mailto:admin@decisionjar.com',
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
        process.env.VAPID_PRIVATE_KEY!
    );
} else {
    console.warn('[Notifications] VAPID keys not configured - push notifications will not work');
}

interface NotificationPayload {
    title: string;
    body: string;
    url?: string;
    icon?: string;
    tag?: string;
    requireInteraction?: boolean;
}

type NotificationPreferenceKey = 'notifyStreakReminder' | 'notifyAchievements' | 'notifyLevelUp' | 'notifyIdeaAdded' | 'notifyJarSpun' | 'notifyVoting';

export async function sendPushNotification(userId: string, payload: NotificationPayload) {
    try {
        // Check if VAPID is configured
        if (!vapidConfigured) {
            console.warn('[Notifications] Skipping push - VAPID not configured');
            return { sent: 0, failed: 0, error: 'VAPID not configured' };
        }

        // 1. Fetch subscriptions for the user
        // @ts-ignore - Schema might be missing from generated client types in this environment
        const subscriptions = await prisma.pushSubscription.findMany({
            where: { userId }
        });

        if (!subscriptions || !subscriptions.length) {
            console.log(`[Notifications] No subscriptions for user ${userId}`);
            return { sent: 0, failed: 0 };
        }

        console.log(`[Notifications] Sending to ${subscriptions.length} subscription(s) for user ${userId}`);

        // 2. Prepare payload
        const data = JSON.stringify({
            title: payload.title,
            body: payload.body,
            url: payload.url || '/',
            icon: payload.icon || '/icon.png',
            tag: payload.tag,
            requireInteraction: payload.requireInteraction
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

export async function notifyJarMembers(
    jarId: string,
    excludeUserId: string | null,
    payload: NotificationPayload,
    preferenceKey?: NotificationPreferenceKey
) {
    try {
        console.log(`[Notifications] notifyJarMembers called for jar ${jarId}, excluding user ${excludeUserId}, preference: ${preferenceKey || 'none'}`);

        // Find active members of the jar with their notification preferences
        const members = await prisma.jarMember.findMany({
            where: {
                jarId,
                userId: excludeUserId ? { not: excludeUserId } : undefined,
                status: 'ACTIVE'
            },
            include: {
                user: {
                    select: {
                        id: true,
                        notifyStreakReminder: true,
                        notifyAchievements: true,
                        notifyLevelUp: true,
                        notifyIdeaAdded: true,
                        notifyJarSpun: true,
                        notifyVoting: true
                    }
                }
            }
        });

        console.log(`[Notifications] Found ${members.length} member(s) to notify`);

        if (members.length === 0) {
            console.log('[Notifications] No members to notify (all excluded or none active)');
            return;
        }

        // Filter by preference if specified
        const eligibleMembers = preferenceKey
            ? members.filter(member => member.user[preferenceKey] === true)
            : members;

        console.log(`[Notifications] ${eligibleMembers.length} member(s) eligible after preference filtering`);

        if (eligibleMembers.length === 0) {
            console.log('[Notifications] No members have this notification enabled');
            return;
        }

        const promises = eligibleMembers.map(member =>
            sendPushNotification(member.user.id, payload)
        );

        const results = await Promise.allSettled(promises);
        const sent = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        console.log(`[Notifications] Results: ${sent} sent, ${failed} failed`);
    } catch (error) {
        console.error("[Notifications] Error notifying jar members for " + jarId, error);
    }
}
