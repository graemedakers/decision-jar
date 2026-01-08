import { NextResponse } from 'next/server';
import { auth } from '@/lib/next-auth-helper';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const subscription = await req.json();

        // Basic validation
        if (!subscription || !subscription.endpoint || !subscription.keys) {
            return new NextResponse("Invalid subscription object", { status: 400 });
        }

        // Save to DB
        await prisma.pushSubscription.create({
            data: {
                userId: session.user.id,
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error saving subscription:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
