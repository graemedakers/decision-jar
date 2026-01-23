import { getSession } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session || !session.user.activeJarId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        let customerId = user?.stripeCustomerId;

        if (!customerId) {
            // Fallback to Jar (Legacy)
            const currentJarId = session.user.activeJarId;
            if (currentJarId) {
                const jar = await prisma.jar.findUnique({
                    where: { id: currentJarId }
                });
                customerId = jar?.stripeCustomerId;
            }
        }

        if (!customerId) {
            return NextResponse.json({ error: "No billing account found" }, { status: 400 });
        }

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        });

        return NextResponse.json({ url: portalSession.url });

    } catch (error) {
        console.error("[STRIPE_PORTAL]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
