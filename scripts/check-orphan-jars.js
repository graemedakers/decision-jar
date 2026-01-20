/**
 * Check for orphan jars in the dev environment
 * An orphan jar is one with no members
 * Usage: node scripts/check-orphan-jars.js
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

async function checkOrphanJars() {
    console.log('🔍 Checking for orphan jars...\n');
    console.log('Database:', DATABASE_URL.split('@')[1].split('/')[0]);
    console.log('\n' + '='.repeat(70) + '\n');

    try {
        // Get all jars with their members
        const allJars = await prisma.jar.findMany({
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                email: true,
                                name: true
                            }
                        }
                    }
                },
                ideas: {
                    select: {
                        id: true,
                        description: true
                    }
                },
                _count: {
                    select: {
                        ideas: true,
                        members: true
                    }
                }
            }
        });

        console.log(`📊 Total jars in database: ${allJars.length}\n`);

        // Find orphan jars (no members)
        const orphanJars = allJars.filter(jar => jar.members.length === 0);

        if (orphanJars.length === 0) {
            console.log('✅ No orphan jars found! Database is clean.\n');
        } else {
            console.log(`⚠️  Found ${orphanJars.length} orphan jar(s):\n`);
            console.log('='.repeat(70));

            orphanJars.forEach((jar, index) => {
                console.log(`\n${index + 1}. Jar: "${jar.name}"`);
                console.log(`   ID: ${jar.id}`);
                console.log(`   Reference Code: ${jar.referenceCode}`);
                console.log(`   Type: ${jar.type}`);
                console.log(`   Topic: ${jar.topic || 'N/A'}`);
                console.log(`   Created: ${jar.createdAt}`);
                console.log(`   Members: ${jar._count.members} (ORPHAN!)`);
                console.log(`   Ideas: ${jar._count.ideas}`);

                if (jar.ideas.length > 0) {
                    console.log(`   Sample ideas:`);
                    jar.ideas.slice(0, 3).forEach(idea => {
                        console.log(`      - ${idea.description}`);
                    });
                    if (jar.ideas.length > 3) {
                        console.log(`      ... and ${jar.ideas.length - 3} more`);
                    }
                }
            });

            console.log('\n' + '='.repeat(70));
        }

        // Also check for jars with only 1 member (potential future orphans)
        const singleMemberJars = allJars.filter(jar => jar.members.length === 1);

        if (singleMemberJars.length > 0) {
            console.log(`\n📌 Info: ${singleMemberJars.length} jar(s) have only 1 member (would become orphan if that user is deleted):\n`);

            singleMemberJars.forEach((jar, index) => {
                const member = jar.members[0];
                console.log(`${index + 1}. "${jar.name}" - owned by ${member.user.email} (${jar._count.ideas} ideas)`);
            });
        }

        // Summary
        console.log('\n' + '='.repeat(70));
        console.log('📊 SUMMARY:');
        console.log('='.repeat(70));
        console.log(`Total jars: ${allJars.length}`);
        console.log(`Orphan jars (0 members): ${orphanJars.length}`);
        console.log(`Single-member jars: ${singleMemberJars.length}`);
        console.log(`Multi-member jars: ${allJars.length - orphanJars.length - singleMemberJars.length}`);
        console.log('='.repeat(70) + '\n');

        // If orphans found, offer deletion info
        if (orphanJars.length > 0) {
            console.log('💡 TIP: To clean up orphan jars, you can:');
            console.log('   1. Delete them manually in the database');
            console.log('   2. Run a cleanup script');
            console.log('   3. They will be automatically cleaned up when you delete users\n');
        }

    } catch (error) {
        console.error('❌ Error checking jars:', error);
        throw error;
    }
}

async function main() {
    try {
        await prisma.$connect();
        console.log('✅ Connected to database\n');

        await checkOrphanJars();

    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
        console.log('👋 Disconnected from database\n');
    }
}

main();
