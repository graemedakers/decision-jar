// @ts-nocheck
/* eslint-disable */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const targetEmail = 'graeme@letmebefree.com';
    console.log(`Checking premium status for ${targetEmail}...`);
    console.log('='.repeat(60));

    const user = await prisma.user.findFirst({
        where: { email: targetEmail },
        select: {
            id: true,
            email: true,
            name: true,
            isLifetimePro: true,
            isSuperAdmin: true,
            subscriptionStatus: true,
            stripeCustomerId: true,
            stripeSubscriptionId: true,
            subscriptionEndsAt: true,
            createdAt: true,
            hasUsedTrial: true,
            activeJarId: true
        }
    })

    if (!user) {
        console.log('❌ User not found');
        return;
    }

    console.log(`\n📧 Email: ${user.email}`);
    console.log(`👤 Name: ${user.name}`);
    console.log(`🆔 ID: ${user.id}`);
    console.log(`📅 Created: ${user.createdAt}`);
    console.log('\n--- Premium Status ---');
    console.log(`💎 Is Lifetime Pro: ${user.isLifetimePro ? '✅ YES' : '❌ NO'}`);
    console.log(`🛡️  Is Super Admin: ${user.isSuperAdmin ? '✅ YES' : '❌ NO'}`);
    console.log(`📊 Subscription Status: ${user.subscriptionStatus || 'None'}`);
    console.log(`🔑 Stripe Customer ID: ${user.stripeCustomerId || 'None'}`);
    console.log(`🔗 Stripe Subscription ID: ${user.stripeSubscriptionId || 'None'}`);
    console.log(`⏰ Subscription Ends: ${user.subscriptionEndsAt || 'N/A'}`);
    console.log(`🎯 Has Used Trial: ${user.hasUsedTrial ? 'Yes' : 'No'}`);
    console.log(`🏺 Active Jar ID: ${user.activeJarId || 'None'}`);

    // Calculate days since creation for trial check
    const now = new Date();
    const created = new Date(user.createdAt);
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    console.log(`\n--- Auto-Trial Status ---`);
    console.log(`🗓️  Days since account creation: ${diffDays}`);
    console.log(`🎁 Within 14-day grace period: ${diffDays <= 14 ? '✅ YES' : '❌ NO'}`);

    // Determine effective premium status
    const isPremium = user.isLifetimePro ||
        user.isSuperAdmin ||
        (user.subscriptionStatus && ['active', 'trialing', 'past_due'].includes(user.subscriptionStatus)) ||
        diffDays <= 14;

    console.log(`\n--- Computed Status ---`);
    console.log(`🌟 Effective Premium: ${isPremium ? '✅ YES' : '❌ NO'}`);
}

main()
    .catch(e => console.error('Error:', e))
    .finally(async () => await prisma.$disconnect())
