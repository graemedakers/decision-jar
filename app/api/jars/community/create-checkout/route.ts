import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
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

function generateRefCode() {
    return 'COM-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, description, memberLimit, imageUrl, topic } = body;

        if (!name || !description) {
            return NextResponse.json({ error: "Name and Description are required" }, { status: 400 });
        }

        // 1. Create the Jar in PENDING_PAYMENT state
        // We set subscriptionStatus to 'PENDING_PAYMENT' or null initially, but we can treat 'null' as unpaid if isCommunityJar is true.
        // Let's use 'PENDING'
        const newJar = await prisma.jar.create({
            data: {
                name,
                description,
                imageUrl,
                memberLimit,
                topic: topic || "General",
                referenceCode: generateRefCode(),
                isCommunityJar: true,
                selectionMode: 'RANDOM',
                type: 'SOCIAL', // Default
                subscriptionStatus: 'PENDING',
                members: {
                    create: {
                        userId: session.user.id,
                        role: 'ADMIN',
                        status: 'ACTIVE'
                    }
                }
            }
        });

        // 2. Check for Specific User Bypass
        if (session.user.email === 'graemedakers@gmail.com') {
            await prisma.jar.update({
                where: { id: newJar.id },
                data: { subscriptionStatus: 'ACTIVE' }
            });

            return NextResponse.json({ url: `${process.env.NEXT_PUBLIC_APP_URL}/community/success?jar_id=${newJar.id}`, jarId: newJar.id }, { headers: corsHeaders });
        }

        // 3. Create Stripe Session
        const targetPriceId = process.env.STRIPE_PRICE_COMMUNITY_YEARLY || 'price_placeholder'; // Needs to be set in .env

        let checkoutSession;

        try {
            checkoutSession = await stripe.checkout.sessions.create({
                mode: 'subscription',
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
                    jarId: newJar.id,
                    type: 'COMMUNITY_JAR_CREATION'
                },
                success_url: `${process.env.NEXT_PUBLIC_APP_URL}/community/success?session_id={CHECKOUT_SESSION_ID}&jar_id=${newJar.id}`,
                cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/community/create?canceled=true`,
            });
        } catch (stripeError: any) {
            // Rollback DB creation if Stripe fails (optional, but good practice)
            await prisma.jar.delete({ where: { id: newJar.id } });
            console.error("Stripe Error:", stripeError);
            throw new Error("Failed to create Stripe session: " + stripeError.message);
        }

        return NextResponse.json({ url: checkoutSession.url, jarId: newJar.id }, { headers: corsHeaders });

    } catch (error: any) {
        console.error("[COMMUNITY_CREATE_ERROR]", error);
        return NextResponse.json({
            error: error?.message || "Internal Server Error",
        }, { status: 500 });
    }
}
