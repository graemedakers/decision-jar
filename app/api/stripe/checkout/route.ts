import { getSession } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { priceId, mode: requestedMode } = body;

        // Default or specific price logic
        const targetPriceId = priceId || process.env.STRIPE_PRICE_ID;

        // Determine Mode
        // Use requested mode if provided, otherwise fallback to comparison logic
        let mode = requestedMode;
        if (!mode) {
            const isLifetime = targetPriceId === process.env.STRIPE_PRICE_LIFETIME;
            mode = isLifetime ? 'payment' : 'subscription';
        }

        const isLifetime = mode === 'payment' || targetPriceId === process.env.STRIPE_PRICE_LIFETIME;

        // Check if user has already used their trial
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { hasUsedTrial: true }
        });

        // Create Checkout Session params
        const checkoutSessionParams: any = {
            mode: mode,
            payment_method_types: ['card'],
            line_items: [
                {
                    price: targetPriceId,
                    quantity: 1,
                },
            ],
            customer_email: session.user.email,
            metadata: {
                userId: session.user.id,
                jarId: (session.user as any).activeJarId || "",
                type: isLifetime ? 'LIFETIME_CB' : 'SUBSCRIPTION_UPGRADE'
            },
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,
        };

        // Subscription Data (Trial) - Only grant trial if user hasn't used it yet
        if (mode === 'subscription') {
            // Only grant trial to users who haven't used their free trial
            if (!user?.hasUsedTrial) {
                checkoutSessionParams.subscription_data = {
                    trial_period_days: 14
                };
                logger.info("[STRIPE_TRIAL_GRANTED]", { userId: session.user.id });
            } else {
                // No trial for users who already used it - they pay immediately
                logger.info("[STRIPE_NO_TRIAL]", { userId: session.user.id, reason: "Already used trial" });
            }
        }

        const checkoutSession = await stripe.checkout.sessions.create(checkoutSessionParams);

        logger.info("[STRIPE_CHECKOUT_SESSION_CREATED]", {
            sessionId: checkoutSession.id,
            userId: session.user.id,
            priceId: targetPriceId,
            mode: mode
        });

        return NextResponse.json({ url: checkoutSession.url }, { headers: corsHeaders });
    } catch (error: any) {
        logger.error("[STRIPE_CHECKOUT_ERROR]", error);
        return NextResponse.json({
            error: error?.message || "Internal Server Error",
            details: error?.toString()
        }, { status: 500 });
    }
}
