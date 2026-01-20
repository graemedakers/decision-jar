/**
 * Clean up orphan jars from the dev environment
 * Usage: node scripts/cleanup-orphan-jars.js
 */

const { PrismaClient } = require('@prisma/client');

// Use DATABASE_URL from environment or fallback to the provided dev URL
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_2wMQpZiD6WOa@ep-cold-glade-a7ckfc7e-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: DATABASE_URL
        }
    }
});

async function cleanupOrphanJars() {
    console.log('🧹 Cleaning up orphan jars...\n');
    console.log('Database:', DATABASE_URL.split('@')[1].split('/')[0]);
    console.log('\n');

    try {
        // Find all orphan jars
        const orphanJars = await prisma.jar.findMany({
            where: {
                members: {
                    none: {}
                }
            },
            include: {
                ideas: true,
                _count: {
                    select: {
                        ideas: true
                    }
                }
            }
        });

        if (orphanJars.length === 0) {
            console.log('✅ No orphan jars found! Database is already clean.\n');
            return;
        }

        console.log(`⚠️  Found ${orphanJars.length} orphan jar(s) to delete\n`);
        console.log('='.repeat(70));

        let deletedCount = 0;
        let errorCount = 0;
        let totalIdeasDeleted = 0;

        for (const jar of orphanJars) {
            try {
                console.log(`\n🗑️  Deleting jar: "${jar.name}" (${jar._count.ideas} ideas)`);
                console.log(`   ID: ${jar.id}`);
                console.log(`   Code: ${jar.referenceCode}`);

                await prisma.$transaction(async (tx) => {
                    const jarIdeaIds = jar.ideas.map(idea => idea.id);

                    if (jarIdeaIds.length > 0) {
                        // Delete votes on jar's ideas
                        const votesDeleted = await tx.vote.deleteMany({
                            where: { ideaId: { in: jarIdeaIds } }
                        });

                        // Delete ratings on jar's ideas  
                        const ratingsDeleted = await tx.rating.deleteMany({
                            where: { ideaId: { in: jarIdeaIds } }
                        });

                        // Delete the ideas
                        const ideasDeleted = await tx.idea.deleteMany({
                            where: { jarId: jar.id }
                        });

                        console.log(`   📊 Deleted: ${ideasDeleted.count} ideas, ${votesDeleted.count} votes, ${ratingsDeleted.count} ratings`);
                        totalIdeasDeleted += ideasDeleted.count;
                    }

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

                    // Delete favorite venues
                    await tx.favoriteVenue.deleteMany({
                        where: { jarId: jar.id }
                    });

                    // Delete the jar
                    await tx.jar.delete({
                        where: { id: jar.id }
                    });
                });

                console.log(`   ✅ Successfully deleted`);
                deletedCount++;

            } catch (error) {
                console.error(`   ❌ Error deleting jar "${jar.name}":`, error.message);
                errorCount++;
            }
        }

        console.log('\n' + '='.repeat(70));
        console.log('📊 CLEANUP SUMMARY:');
        console.log('='.repeat(70));
        console.log(`✅ Jars deleted: ${deletedCount}`);
        console.log(`📝 Ideas deleted: ${totalIdeasDeleted}`);
        console.log(`❌ Errors: ${errorCount}`);
        console.log(`📦 Total processed: ${orphanJars.length}`);
        console.log('='.repeat(70) + '\n');

    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        throw error;
    }
}

async function main() {
    try {
        await prisma.$connect();
        console.log('✅ Connected to database\n');

        await cleanupOrphanJars();

    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
        console.log('👋 Disconnected from database\n');
    }
}

main();
