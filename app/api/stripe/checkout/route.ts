import { getSession } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';

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
        const { priceId } = body;

        // Default or specific price logic
        const targetPriceId = priceId || process.env.STRIPE_PRICE_ID;

        // Determine Mode
        // If it matches the lifetime price ID, it's one-time payment. Otherwise subscription.
        const isLifetime = targetPriceId === process.env.STRIPE_PRICE_LIFETIME;
        const mode = isLifetime ? 'payment' : 'subscription';

        // Subscription Data (Trial)
        // Only apply trial if it's a subscription and User hasn't used one? 
        // For simplicity, we configure the Trial on the Stripe Price itself in Dashboard, 
        // OR we pass it here. Let's pass it here if subscription.
        const subscription_data = mode === 'subscription' ? {
            trial_period_days: 14
        } : undefined;

        const checkoutSession = await stripe.checkout.sessions.create({
            mode: mode,
            payment_method_types: ['card'],
            line_items: [
                {
                    price: targetPriceId,
                    quantity: 1,
                },
            ],
            subscription_data: subscription_data,
            customer_email: session.user.email, // Pre-fill email
            metadata: {
                userId: session.user.id,
                jarId: (session.user as any).activeJarId || "", // Optional context
                type: isLifetime ? 'LIFETIME_CB' : 'SUBSCRIPTION_UPGRADE'
            },
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,
        });

        console.log("[STRIPE_CHECKOUT_SESSION_CREATED]", {
            sessionId: checkoutSession.id,
            userId: session.user.id,
            priceId: targetPriceId,
            mode: mode
        });

        return NextResponse.json({ url: checkoutSession.url }, { headers: corsHeaders });
    } catch (error: any) {
        console.error("[STRIPE_CHECKOUT_ERROR]", error);
        return NextResponse.json({
            error: error?.message || "Internal Server Error",
            details: error?.toString()
        }, { status: 500 });
    }
}
