import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { logger } from '@/lib/logger';

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get('Stripe-Signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
        // Log successful signature verification
        logger.info(`[STRIPE_WEBHOOK] ✅ Verified: ${event.type} (${event.id})`);
    } catch (error: any) {
        // Log signature verification failures
        logger.error(`[STRIPE_WEBHOOK] ❌ Verification failed:`, error);
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === 'checkout.session.completed') {
        const metadata = session.metadata;

        if (metadata?.type === 'SUBSCRIPTION_UPGRADE') {
            const userId = metadata.userId;
            if (userId) {
                logger.info(`[STRIPE_WEBHOOK] Processing subscription upgrade for user ${userId}`);
                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        stripeCustomerId: session.customer as string,
                        stripeSubscriptionId: session.subscription as string,
                        subscriptionStatus: 'active' // Or fetch status from subscription? Default active for simplified flow
                    }
                });
                logger.info(`[STRIPE_WEBHOOK] ✅ Subscription upgrade completed for user ${userId}`);
            } else {
                logger.warn(`[STRIPE_WEBHOOK] ⚠️ SUBSCRIPTION_UPGRADE missing userId in metadata`);
            }
        } else if (metadata?.type === 'LIFETIME_CB') {
            const userId = metadata.userId;
            if (userId) {
                logger.info(`[STRIPE_WEBHOOK] Processing lifetime pro upgrade for user ${userId}`);
                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        isLifetimePro: true,
                        // Store customer ID for invoices even if no subscription
                        stripeCustomerId: session.customer as string,
                    }
                });
                logger.info(`[STRIPE_WEBHOOK] ✅ Lifetime pro granted to user ${userId}`);
            } else {
                logger.warn(`[STRIPE_WEBHOOK] ⚠️ LIFETIME_CB missing userId in metadata`);
            }
        } else if (metadata?.type === 'NEW_COUPLE_SIGNUP') {
            const { name, email, passwordHash, location } = metadata;

            if (!name || !email || !passwordHash) {
                logger.error(`[STRIPE_WEBHOOK] ❌ NEW_COUPLE_SIGNUP missing required metadata`);
                return new NextResponse('Webhook Error: Missing user details in metadata', { status: 400 });
            }

            logger.info(`[STRIPE_WEBHOOK] Processing new couple signup for ${email}`);

            // Create Jar (formerly Couple)
            const referenceCode = Math.random().toString(36).substring(2, 8).toUpperCase();

            // Using transaction to ensure user isn't created without jar or vice-versa
            await prisma.$transaction(async (tx) => {
                const jar = await tx.jar.create({
                    data: {
                        referenceCode,
                        location: location || null,
                        isPremium: true,
                        name: "My Jar",
                        type: "ROMANTIC"
                    },
                });

                // Create User
                const user = await tx.user.create({
                    data: {
                        email,
                        name,
                        passwordHash,
                        activeJarId: jar.id,
                        hasUsedTrial: true,
                    },
                });

                // Add member
                await tx.jarMember.create({
                    data: {
                        jarId: jar.id,
                        userId: user.id,
                        role: "ADMIN"
                    }
                });

                logger.info(`[STRIPE_WEBHOOK] ✅ Created new user and jar for ${email} (${user.id})`);
            });
        }
    } else if (event.type === 'customer.subscription.updated') {
        const subscription = event.data.object as Stripe.Subscription;
        logger.info(`[STRIPE_WEBHOOK] Processing subscription.updated for ${subscription.id}: ${subscription.status}`);

        // Find USER by stripeSubscriptionId and update status
        const result = await prisma.user.updateMany({
            where: { stripeSubscriptionId: subscription.id },
            data: {
                subscriptionStatus: subscription.status
            }
        });
        logger.info(`[STRIPE_WEBHOOK] ✅ Updated ${result.count} user(s) to status: ${subscription.status}`);



        if (subscription.status === 'past_due') {
            // Find user to get email logic (updateMany doesn't return the record)
            const user = await prisma.user.findFirst({
                where: { stripeSubscriptionId: subscription.id },
                select: { email: true, name: true }
            });

            if (user) {
                // TODO: Implement sendPaymentDueEmail(user.email, user.name);
                logger.info(`[PAYMENT_DUE] Sending email to ${user.email} (Status: past_due)`);
                // Example: await sendEmail(user.email, "Action Required: Payment Failed", "Please update your payment method to keep access.");
            } else {
                logger.warn(`[STRIPE_WEBHOOK] ⚠️ Could not find user for subscription ${subscription.id}`);
            }
        }
    } else if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object as Stripe.Subscription;
        logger.info(`[STRIPE_WEBHOOK] Processing subscription.deleted for ${subscription.id}`);

        const result = await prisma.user.updateMany({
            where: { stripeSubscriptionId: subscription.id },
            data: {
                subscriptionStatus: 'canceled',
                subscriptionEndsAt: new Date((subscription as any).current_period_end * 1000)
            }
        });
        logger.info(`[STRIPE_WEBHOOK] ✅ Canceled ${result.count} user subscription(s)`);


    }

    logger.info(`[STRIPE_WEBHOOK] ✅ Successfully processed ${event.type}`);
    return new NextResponse(null, { status: 200 });
}
