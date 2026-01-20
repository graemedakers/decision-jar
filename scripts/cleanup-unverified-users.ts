
import { PrismaClient } from '@prisma/client';
import { deleteUserCompletely } from '../lib/user-admin';

const prisma = new PrismaClient();

// --- PRODUCTION SAFETY LOCK ---
const DATABASE_URL = process.env.DATABASE_URL || '';
const IS_PROD_URL = DATABASE_URL.includes('ep-weathered-sun') ||
    (DATABASE_URL.includes('pooler') && !DATABASE_URL.includes('cold-glade'));

if (IS_PROD_URL && process.env.PRODUCTION_LOCK !== 'OFF') {
    console.error('\n❌ PRODUCTION SAFETY LOCK ACTIVE');
    console.error('This script is attempting to run against a production or pooled database instance.');
    console.error('Hostname:', DATABASE_URL.split('@')[1]?.split('/')[0] || 'Unknown');
    console.error('\nTo bypass this safety lock, set the environment variable:');
    console.error('  PRODUCTION_LOCK=OFF');
    console.error('\nOperation aborted for safety.\n');
    process.exit(1);
}
// ------------------------------

async function cleanupUnverifiedUsers() {
    console.log('Starting cleanup of unverified users...');

    // Calculate the date 14 days ago
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    // Find users who:
    // 1. Are NOT premium (lifetime pro or active subscription)
    // 2. Haven't verified their email
    // 3. Created their account more than 14 days ago
    const usersToDelete = await prisma.user.findMany({
        where: {
            emailVerified: null,
            createdAt: {
                lt: twoWeeksAgo
            },
            isLifetimePro: false,
            OR: [
                { subscriptionStatus: null },
                { subscriptionStatus: { notIn: ['active', 'trialing', 'past_due'] } }
            ]
        },
        select: {
            id: true,
            email: true,
            createdAt: true
        }
    });

    console.log(`Found ${usersToDelete.length} unverified users older than 14 days.`);

    let successCount = 0;
    let failCount = 0;

    for (const user of usersToDelete) {
        try {
            console.log(`Deleting user: ${user.email} (created: ${user.createdAt.toISOString()})`);

            // Use a transaction for each user to ensure safety
            await prisma.$transaction(async (tx) => {
                await deleteUserCompletely(tx, user.id);
            });

            successCount++;
            console.log(`Successfully deleted ${user.email}`);
        } catch (error) {
            failCount++;
            console.error(`Failed to delete user ${user.email}:`, error);
        }
    }

    console.log('\n--- Cleanup Summary ---');
    console.log(`Processed: ${usersToDelete.length}`);
    console.log(`Successfully Deleted: ${successCount}`);
    console.log(`Failed: ${failCount}`);
}

cleanupUnverifiedUsers()
    .catch((error) => {
        console.error('Fatal error during cleanup:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
