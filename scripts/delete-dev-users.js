/**
 * Delete specific users from the dev environment
 * Usage: node scripts/delete-dev-users.js
 */

const { PrismaClient } = require('@prisma/client');

// Use DATABASE_URL from environment or fallback to the provided dev URL
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_2wMQpZiD6WOa@ep-cold-glade-a7ckfc7e-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

// --- PRODUCTION SAFETY LOCK ---
const IS_PROD_URL = DATABASE_URL.includes('ep-weathered-sun') ||
    (DATABASE_URL.includes('pooler') && !DATABASE_URL.includes('cold-glade'));

if (IS_PROD_URL && process.env.PRODUCTION_LOCK !== 'OFF') {
    console.error('\n❌ PRODUCTION SAFETY LOCK ACTIVE');
    console.error('This script is attempting to run against a production or pooled database instance.');
    console.error('Hostname:', DATABASE_URL.split('@')[1]?.split('/')[0] || 'Unknown');
    console.error('\nTo bypass this safety lock, set the environment variable:');
    console.error('  PRODUCTION_LOCK=OFF');
    console.error('\nDeletion aborted for safety.\n');
    process.exit(1);
}
// ------------------------------

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: DATABASE_URL
        }
    }
});

// Users to delete
const USERS_TO_DELETE = [
    'graeme_dakers@hotmail.com',
    'graeme@letmebefree.com',
    'graeme@spinthejar.com',
    'graemedakers@gmail.com'
];

async function deleteUsers() {
    console.log('🗑️  Starting user deletion...\n');
    console.log('Database:', DATABASE_URL.split('@')[1].split('/')[0]);
    console.log('\nUsers to delete:');
    USERS_TO_DELETE.forEach(email => console.log(`  - ${email}`));
    console.log('\n');

    let deletedCount = 0;
    let notFoundCount = 0;
    let errorCount = 0;

    for (const email of USERS_TO_DELETE) {
        try {
            // Find the user
            const user = await prisma.user.findUnique({
                where: { email: email.toLowerCase().trim() },
                include: {
                    memberships: true,
                    createdIdeas: true,
                    ratings: true,
                    votes: true,
                    accounts: true,
                    sessions: true
                }
            });

            if (!user) {
                console.log(`⚠️  User not found: ${email}`);
                notFoundCount++;
                continue;
            }

            console.log(`\n🔍 Found user: ${email}`);
            console.log(`   - ID: ${user.id}`);
            console.log(`   - Created: ${user.createdAt}`);
            console.log(`   - Memberships: ${user.memberships.length}`);
            console.log(`   - Ideas: ${user.createdIdeas.length}`);
            console.log(`   - Ratings: ${user.ratings.length}`);
            console.log(`   - Votes: ${user.votes.length}`);
            console.log(`   - Accounts: ${user.accounts.length}`);
            console.log(`   - Sessions: ${user.sessions.length}`);

            // Delete in transaction to ensure clean deletion
            await prisma.$transaction(async (tx) => {
                // Delete related records first (Prisma should handle cascade, but being explicit)

                // Delete sessions
                await tx.session.deleteMany({
                    where: { userId: user.id }
                });

                // Delete accounts (OAuth)
                await tx.account.deleteMany({
                    where: { userId: user.id }
                });

                // Delete votes
                await tx.vote.deleteMany({
                    where: { userId: user.id }
                });

                // Delete ratings
                await tx.rating.deleteMany({
                    where: { userId: user.id }
                });

                // Delete push subscriptions
                await tx.pushSubscription.deleteMany({
                    where: { userId: user.id }
                });

                // Delete analytics events
                await tx.analyticsEvent.deleteMany({
                    where: { userId: user.id }
                });

                // Delete app reviews
                await tx.appReview.deleteMany({
                    where: { userId: user.id }
                });

                // Delete favorite venues
                await tx.favoriteVenue.deleteMany({
                    where: { userId: user.id }
                });

                // Handle orphan jars - Delete jars where this user is the only member
                const userJarIds = user.memberships.map(m => m.jarId);

                if (userJarIds.length > 0) {
                    console.log(`   🔍 Checking for orphan jars...`);

                    // Find jars where this user is the only member
                    const orphanJars = await tx.jar.findMany({
                        where: {
                            id: { in: userJarIds }
                        },
                        include: {
                            members: true,
                            ideas: true
                        }
                    });

                    const jarsToDelete = orphanJars.filter(jar => jar.members.length === 1);

                    if (jarsToDelete.length > 0) {
                        console.log(`   ⚠️  Found ${jarsToDelete.length} orphan jar(s) to delete...`);

                        for (const jar of jarsToDelete) {
                            console.log(`      - Deleting jar "${jar.name}" (${jar.ideas.length} ideas)`);

                            const jarIdeaIds = jar.ideas.map(idea => idea.id);

                            if (jarIdeaIds.length > 0) {
                                // Delete votes on jar's ideas
                                await tx.vote.deleteMany({
                                    where: { ideaId: { in: jarIdeaIds } }
                                });

                                // Delete ratings on jar's ideas
                                await tx.rating.deleteMany({
                                    where: { ideaId: { in: jarIdeaIds } }
                                });

                                // Delete the ideas in this jar
                                await tx.idea.deleteMany({
                                    where: { jarId: jar.id }
                                });
                            }

                            // Delete jar members (should only be the one user, but being thorough)
                            await tx.jarMember.deleteMany({
                                where: { jarId: jar.id }
                            });

                            // Delete vote sessions
                            await tx.voteSession.deleteMany({
                                where: { jarId: jar.id }
                            });

                            // Delete unlocked achievements
                            await tx.unlockedAchievement.deleteMany({
                                where: { jarId: jar.id }
                            });

                            // Delete deleted logs
                            await tx.deletedLog.deleteMany({
                                where: { jarId: jar.id }
                            });

                            // Delete favorite venues for this jar
                            await tx.favoriteVenue.deleteMany({
                                where: { jarId: jar.id }
                            });

                            // Finally delete the jar itself
                            await tx.jar.delete({
                                where: { id: jar.id }
                            });
                        }

                        console.log(`   ✅ Cleaned up ${jarsToDelete.length} orphan jar(s)`);
                    } else {
                        console.log(`   ✅ No orphan jars found`);
                    }
                }

                // Delete jar memberships (for jars with other members)
                await tx.jarMember.deleteMany({
                    where: { userId: user.id }
                });

                // Delete ideas they created (requires deleting related records first)
                if (user.createdIdeas.length > 0) {
                    console.log(`   ⚠️  Deleting data for ${user.createdIdeas.length} ideas created by this user...`);

                    const ideaIds = user.createdIdeas.map(idea => idea.id);

                    // Delete votes on their ideas
                    await tx.vote.deleteMany({
                        where: { ideaId: { in: ideaIds } }
                    });

                    // Delete ratings on their ideas
                    await tx.rating.deleteMany({
                        where: { ideaId: { in: ideaIds } }
                    });

                    // Now delete the ideas
                    await tx.idea.deleteMany({
                        where: { createdById: user.id }
                    });
                }

                // Delete premium tokens created by this user
                await tx.premiumInviteToken.deleteMany({
                    where: { createdById: user.id }
                });

                // Reset premium tokens used by this user
                await tx.premiumInviteToken.updateMany({
                    where: { usedById: user.id },
                    data: { usedById: null, usedAt: null, currentUses: { decrement: 1 } }
                });

                // Finally, delete the user
                await tx.user.delete({
                    where: { id: user.id }
                });
            });

            console.log(`✅ Successfully deleted user: ${email}`);
            deletedCount++;

        } catch (error) {
            console.error(`❌ Error deleting ${email}:`, error.message);
            errorCount++;
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 DELETION SUMMARY:');
    console.log('='.repeat(60));
    console.log(`✅ Successfully deleted: ${deletedCount}`);
    console.log(`⚠️  Not found: ${notFoundCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📝 Total processed: ${USERS_TO_DELETE.length}`);
    console.log('='.repeat(60) + '\n');
}

async function main() {
    try {
        // Verify connection
        await prisma.$connect();
        console.log('✅ Connected to database\n');

        // Run deletion
        await deleteUsers();

    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
        console.log('👋 Disconnected from database');
    }
}

main();
