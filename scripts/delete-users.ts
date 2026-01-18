import { PrismaClient } from '@prisma/client';

const args = process.argv.slice(2);
const databaseUrlArg = args.find(arg => arg.startsWith('--database-url='));
const databaseUrl = databaseUrlArg ? databaseUrlArg.split('=')[1] : process.env.DATABASE_URL;

if (!databaseUrl) {
    console.error('❌ ERROR: No database URL provided');
    console.error('Usage: npx tsx scripts/delete-users.ts --database-url="postgresql://..." [emails... | --all]');
    process.exit(1);
}

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: databaseUrl
        }
    }
});

async function main() {
    let emailsToDelete: string[] = args.filter(arg => !arg.startsWith('--') && arg !== 'ALL');
    const isAll = args.includes('--all') || args.includes('ALL');

    if (isAll) {
        console.log('🔄 Fetching ALL users from database...');
        const allUsers = await prisma.user.findMany({
            select: { email: true }
        });
        emailsToDelete = allUsers.map(u => u.email);
        console.log(`Found ${emailsToDelete.length} users to delete.`);
    }

    if (emailsToDelete.length === 0) {
        console.error('❌ ERROR: No users specified to delete.');
        process.exit(1);
    }

    console.log(`📧 Emails to delete: ${emailsToDelete.length > 10 ? emailsToDelete.slice(0, 10).join(', ') + '...' : emailsToDelete.join(', ')}\n`);

    for (const email of emailsToDelete) {
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
                    rateLimit: true
                }
            });

            if (!user) {
                console.log(`❌ User not found (or already deleted): ${email}`);
                continue;
            }

            console.log(`✓ Found user: ${user.id}`);

            // Delete in transaction to ensure atomicity
            await prisma.$transaction(async (tx) => {
                // 1. Delete all ideas created by this user
                // Note: We use deleteMany which doesn't throw if zero
                const deletedIdeas = await tx.idea.deleteMany({ where: { createdById: user.id } });
                console.log(`  ✓ Deleted ${deletedIdeas.count} ideas`);

                // 2. Delete all ratings
                await tx.rating.deleteMany({ where: { userId: user.id } });

                // 3. Delete all votes
                await tx.vote.deleteMany({ where: { userId: user.id } });

                // 4. Delete all favorites
                await tx.favoriteVenue.deleteMany({ where: { userId: user.id } });

                // 5. Delete all app reviews
                await tx.appReview.deleteMany({ where: { userId: user.id } });

                // 6. Delete all analytics events
                await tx.analyticsEvent.deleteMany({ where: { userId: user.id } });

                // 7. Delete all push subscriptions
                await tx.pushSubscription.deleteMany({ where: { userId: user.id } });

                // 8. Delete Premium Tokens (Created and Used)
                // Need to update tokens used by this user to null first if we want to keep them? 
                // Or delete them if getting rid of user data completely.
                // Reset 'usedBy'
                await tx.premiumInviteToken.updateMany({
                    where: { usedById: user.id },
                    data: { usedById: null, usedAt: null, currentUses: { decrement: 1 } }
                });
                // Delete created tokens
                await tx.premiumInviteToken.deleteMany({ where: { createdById: user.id } });

                // 9. Delete rate limit
                if (user.rateLimit) {
                    await tx.rateLimit.delete({ where: { userId: user.id } });
                }

                // 10. Handle Jars
                for (const membership of user.memberships) {
                    // Refresh jar status inside transaction just in case
                    const jar = await tx.jar.findUnique({ where: { id: membership.jarId } });

                    if (!jar) {
                        console.log(`  ✓ Jar ${membership.jarId} already deleted`);
                        continue;
                    }

                    const adminCount = await tx.jarMember.count({
                        where: { jarId: jar.id, role: 'ADMIN' }
                    });

                    // If user is the LAST admin, or if we are wiping everything and we want to clean up empty jars...
                    // The logic "User is only admin" logic is good for specific user deletion.
                    // If deleting ALL users, eventually the last admin will be processed and the jar deleted.

                    if (membership.role === 'ADMIN' && adminCount === 1) {
                        console.log(`  ⚠ Deleting jar "${jar.name}" (user is only/last admin)`);

                        // Delete FK dependencies for Jar
                        await tx.unlockedAchievement.deleteMany({ where: { jarId: jar.id } });
                        await tx.favoriteVenue.deleteMany({ where: { jarId: jar.id } }); // Jars can have favorites linked
                        await tx.deletedLog.deleteMany({ where: { jarId: jar.id } });
                        await tx.voteSession.deleteMany({ where: { jarId: jar.id } });
                        await tx.idea.deleteMany({ where: { jarId: jar.id } }); // Delete remaining ideas in jar

                        await tx.jarMember.deleteMany({ where: { jarId: jar.id } });
                        await tx.jar.delete({ where: { id: jar.id } });
                        console.log(`    ✓ Jar deleted`);
                    } else {
                        // User is not the last admin, just leave the jar
                        await tx.jarMember.delete({ where: { id: membership.id } });
                        console.log(`  ✓ Left jar "${jar.name}"`);
                    }
                }

                // 11. Delete OAuth accounts & Sessions
                await tx.account.deleteMany({ where: { userId: user.id } });
                await tx.session.deleteMany({ where: { userId: user.id } });

                // 12. Delete User
                await tx.user.delete({ where: { id: user.id } });
                console.log(`  ✅ User deleted successfully`);
            });

        } catch (error) {
            console.error(`❌ Error deleting user ${email}:`, error);
        }
    }

    console.log('\n✅ Process completed!');
}

main()
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
