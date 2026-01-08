import { NextResponse } from 'next/server';
import { auth } from '@/lib/next-auth-helper';
import { prisma } from '@/lib/prisma';
import webpush from 'web-push';

// Initialize web-push
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        process.env.VAPID_SUBJECT || 'mailto:admin@example.com',
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        // Strict admin check or specific logic needed here for production
        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { title, message, targetUserId, url } = await req.json();

        if (!title || !message) {
            return new NextResponse("Missing title or message", { status: 400 });
        }

        // Fetch subscriptions
        const whereClause = targetUserId ? { userId: targetUserId } : { userId: session.user.id }; // Default to sending to self if no target

        const subscriptions = await prisma.pushSubscription.findMany({
            where: whereClause
        });

        if (subscriptions.length === 0) {
            return NextResponse.json({ success: false, message: "No subscriptions found" });
        }

        const payload = JSON.stringify({
            title,
            body: message,
            url: url || '/dashboard',
            icon: '/icon.png'
        });

        const results = await Promise.allSettled(
            subscriptions.map(async (sub) => {
                try {
                    await webpush.sendNotification({
                        endpoint: sub.endpoint,
                        keys: {
                            p256dh: sub.p256dh,
                            auth: sub.auth
                        }
                    }, payload);
                    return { success: true, id: sub.id };
                } catch (error: any) {
                    if (error.statusCode === 410 || error.statusCode === 404) {
                        // Subscription expired/gone, cleanup
                        await prisma.pushSubscription.delete({ where: { id: sub.id } });
                    }
                    throw error;
                }
            })
        );

        const fulfilled = results.filter(r => r.status === 'fulfilled').length;

        return NextResponse.json({
            success: true,
            sent: fulfilled,
            total: subscriptions.length
        });

    } catch (error) {
        console.error("Error sending notification:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
