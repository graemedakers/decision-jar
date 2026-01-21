// @ts-nocheck
/* eslint-disable */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const targetEmail = 'graeme@letmebefree.com';
    console.log(`Manually granting lifetime access to ${targetEmail}...`);
    console.log('='.repeat(60));

    const user = await prisma.user.findFirst({
        where: { email: targetEmail }
    })

    if (!user) {
        console.log('❌ User not found');
        return;
    }

    console.log(`\n📧 Found user: ${user.email} (ID: ${user.id})`);
    console.log(`\nCurrent status:`);
    console.log(`  - isLifetimePro: ${user.isLifetimePro}`);
    console.log(`  - stripeCustomerId: ${user.stripeCustomerId || 'None'}`);

    // Update user to lifetime pro
    const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
            isLifetimePro: true,
            // Note: Not setting stripeCustomerId since this is a manual fix
            // The webhook should have set this, but we're bypassing that
        }
    });

    console.log(`\n✅ Successfully granted lifetime access!`);
    console.log(`\nNew status:`);
    console.log(`  - isLifetimePro: ${updated.isLifetimePro}`);

    console.log(`\n⚠️  Note: This is a manual fix. The webhook didn't process correctly.`);
    console.log(`   Possible reasons:`);
    console.log(`   1. Webhook endpoint not configured in Stripe dashboard`);
    console.log(`   2. STRIPE_WEBHOOK_SECRET environment variable incorrect`);
    console.log(`   3. Payment not completed in Stripe`);
    console.log(`   4. Webhook signature verification failed`);
    console.log(`\n   Check Stripe dashboard > Developers > Webhooks to verify delivery.`);
}

main()
    .catch(e => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => await prisma.$disconnect())
