import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteUsersByEmail(emails: string[]) {
    console.log('Starting user deletion process...');

    for (const email of emails) {
        console.log(`\n--- Processing: ${email} ---`);

        try {
            const user = await prisma.user.findUnique({
                where: { email },
                include: {
                    memberships: {
                        include: {
                            jar: true
                        }
                    },
                    createdIdeas: true,
                    accounts: true,
                    sessions: true,
                    ratings: true,
                    votes: true,
                    favorites: true,
                    appReviews: true,
                    analyticsEvents: true,
                    pushSubscriptions: true,
                    rateLimit: true
                }
            });

            if (!user) {
                console.log(`❌ User not found: ${email}`);
                continue;
            }

            console.log(`✓ Found user: ${user.id}`);
            console.log(`  - Memberships: ${user.memberships.length}`);
            console.log(`  - Created Ideas: ${user.createdIdeas.length}`);
            console.log(`  - Accounts: ${user.accounts.length}`);
            console.log(`  - Sessions: ${user.sessions.length}`);
            console.log(`  - Ratings: ${user.ratings.length}`);
            console.log(`  - Votes: ${user.votes.length}`);
            console.log(`  - Favorites: ${user.favorites.length}`);
            console.log(`  - App Reviews: ${user.appReviews.length}`);
            console.log(`  - Analytics Events: ${user.analyticsEvents.length}`);
            console.log(`  - Push Subscriptions: ${user.pushSubscriptions.length}`);

            // Delete in transaction to ensure atomicity
            await prisma.$transaction(async (tx) => {
                // 1. Delete all ideas created by this user (cascade will handle related data)
                const deletedIdeas = await tx.idea.deleteMany({
                    where: { createdById: user.id }
                });
                console.log(`  ✓ Deleted ${deletedIdeas.count} ideas`);

                // 2. Delete all ratings by this user
                const deletedRatings = await tx.rating.deleteMany({
                    where: { userId: user.id }
                });
                console.log(`  ✓ Deleted ${deletedRatings.count} ratings`);

                // 3. Delete all votes by this user
                const deletedVotes = await tx.vote.deleteMany({
                    where: { userId: user.id }
                });
                console.log(`  ✓ Deleted ${deletedVotes.count} votes`);

                // 4. Delete all favorites by this user
                const deletedFavorites = await tx.favoriteVenue.deleteMany({
                    where: { userId: user.id }
                });
                console.log(`  ✓ Deleted ${deletedFavorites.count} favorites`);

                // 5. Delete all app reviews by this user
                const deletedReviews = await tx.appReview.deleteMany({
                    where: { userId: user.id }
                });
                console.log(`  ✓ Deleted ${deletedReviews.count} app reviews`);

                // 6. Delete all analytics events by this user
                const deletedAnalytics = await tx.analyticsEvent.deleteMany({
                    where: { userId: user.id }
                });
                console.log(`  ✓ Deleted ${deletedAnalytics.count} analytics events`);

                // 7. Delete all push subscriptions
                const deletedPushSubs = await tx.pushSubscription.deleteMany({
                    where: { userId: user.id }
                });
                console.log(`  ✓ Deleted ${deletedPushSubs.count} push subscriptions`);

                // 8. Delete rate limit records
                if (user.rateLimit) {
                    await tx.rateLimit.delete({
                        where: { userId: user.id }
                    });
                    console.log(`  ✓ Deleted rate limit record`);
                }

                // 9. Handle jars - delete if user is the only admin, otherwise just remove membership
                for (const membership of user.memberships) {
                    const jar = membership.jar;
                    const adminCount = await tx.jarMember.count({
                        where: {
                            jarId: jar.id,
                            role: 'ADMIN'
                        }
                    });

                    if (adminCount === 1 && membership.role === 'ADMIN') {
                        // User is the only admin, delete the entire jar
                        console.log(`  ⚠ Deleting jar "${jar.name}" (user is only admin)`);

                        // Delete all jar members first
                        await tx.jarMember.deleteMany({
                            where: { jarId: jar.id }
                        });

                        // Delete the jar (cascade will handle ideas, etc.)
                        await tx.jar.delete({
                            where: { id: jar.id }
                        });
                    } else {
                        // Just remove the membership
                        await tx.jarMember.delete({
                            where: { id: membership.id }
                        });
                        console.log(`  ✓ Removed membership from jar "${jar.name}"`);
                    }
                }

                // 10. Delete OAuth accounts
                const deletedAccounts = await tx.account.deleteMany({
                    where: { userId: user.id }
                });
                console.log(`  ✓ Deleted ${deletedAccounts.count} OAuth accounts`);

                // 11. Delete sessions
                const deletedSessions = await tx.session.deleteMany({
                    where: { userId: user.id }
                });
                console.log(`  ✓ Deleted ${deletedSessions.count} sessions`);

                // 12. Finally, delete the user
                await tx.user.delete({
                    where: { id: user.id }
                });
                console.log(`  ✅ User deleted successfully`);
            });

            console.log(`✅ Completed deletion for: ${email}`);
        } catch (error) {
            console.error(`❌ Error deleting user ${email}:`, error);
            throw error;
        }
    }

    console.log('\n✅ All deletions completed successfully!');
}

// Run the deletion
const emailsToDelete = [
    'graeme_dakers@hotmail.com',
    'graeme@letmebefree.com',
    'graeme@letmbefree.com'
];

deleteUsersByEmail(emailsToDelete)
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
