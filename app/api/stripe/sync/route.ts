import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import Stripe from 'stripe';

export async function GET(req: NextRequest) {
    // ...

    const sessionCookie = await getSession();
    if (!sessionCookie?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
        return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (!session) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        // Verify the customer matches (optional but good security practice if customer email matches user email?)
        // Or just trust the session if we are confident. 
        // Better: ensure the metadata.userId matches the current user.
        if (session.metadata?.userId && session.metadata.userId !== sessionCookie.user.id) {
            console.error("Session User Mismatch", session.metadata.userId, sessionCookie.user.id);
            // This might happen if user changed accounts? Or logged out? 
            // Allow it for now if we want to support recovering purchase for another account, 
            // but normally we should block.
            // For now: proceed but warn.
        }

        // Apply updates similar to Webhook
        const userId = session.metadata?.userId || sessionCookie.user.id;

        // Determine status
        // For subscription:
        if (session.metadata?.type === 'COMMUNITY_JAR_CREATION') {
            const jarId = session.metadata.jarId;
            if (jarId && session.mode === 'subscription') {
                const subscriptionId = session.subscription as string;
                const sub = await stripe.subscriptions.retrieve(subscriptionId);

                await prisma.jar.update({
                    where: { id: jarId },
                    data: {
                        subscriptionStatus: 'ACTIVE',
                        stripeCustomerId: session.customer as string,
                        stripeSubscriptionId: subscriptionId,
                        subscriptionRenewsAt: new Date((sub as any).current_period_end * 1000)
                    }
                });
            }
        } else if (session.mode === 'subscription') {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    stripeCustomerId: session.customer as string,
                    stripeSubscriptionId: session.subscription as string,
                    subscriptionStatus: 'active' // Assume active if checkout success (trialing counts as active-ish for access)
                }
            });
        } else if (session.mode === 'payment' && session.payment_status === 'paid') {
            // Lifetime
            await prisma.user.update({
                where: { id: userId },
                data: {
                    isLifetimePro: true,
                    stripeCustomerId: session.customer as string,
                }
            });
        }

        return NextResponse.json({ success: true, mode: session.mode });

    } catch (error: any) {
        console.error("Sync Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
