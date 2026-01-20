/**
 * Cleanup Orphan "My First Jar" Records
 * 
 * This script identifies and deletes orphan jars created during OAuth signup
 * when users were invited to join an existing jar.
 * 
 * Criteria for orphan jars:
 * 1. Name = "My First Jar"
 * 2. Has 0 ideas
 * 3. Has exactly 1 member (the creator as OWNER)
 * 4. User's activeJarId points to a DIFFERENT jar
 * 
 * Usage:
 *   npx tsx scripts/cleanup-orphan-jars.ts [--dry-run] [--database-url=...]
 */

import { PrismaClient } from '@prisma/client';

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const databaseUrlArg = args.find(arg => arg.startsWith('--database-url='));
const databaseUrl = databaseUrlArg ? databaseUrlArg.split('=')[1] : process.env.DATABASE_URL;

if (!databaseUrl) {
    console.error('❌ ERROR: No database URL provided');
    console.error('Usage: npx tsx scripts/cleanup-orphan-jars.ts --database-url="postgresql://..."');
    process.exit(1);
}

// --- PRODUCTION SAFETY LOCK ---
const IS_PROD_URL = databaseUrl.includes('ep-weathered-sun') ||
    (databaseUrl.includes('pooler') && !databaseUrl.includes('cold-glade'));

if (IS_PROD_URL && process.env.PRODUCTION_LOCK !== 'OFF') {
    console.error('\n❌ PRODUCTION SAFETY LOCK ACTIVE');
    console.error('This script is attempting to run against a production or pooled database instance.');
    console.error('Hostname:', databaseUrl.split('@')[1]?.split('/')[0] || 'Unknown');
    console.error('\nTo bypass this safety lock, set the environment variable:');
    console.error('  PRODUCTION_LOCK=OFF');
    console.error('\nOperation aborted for safety.\n');
    process.exit(1);
}
// ------------------------------

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: databaseUrl
        }
    }
});

async function main() {
    console.log('🔍 Searching for orphan "My First Jar" records...\n');
    console.log(`Mode: ${isDryRun ? '🔬 DRY RUN (no changes will be made)' : '🗑️  DELETE MODE'}\n`);

    try {
        // Find all jars named "My First Jar"
        const myFirstJars = await prisma.jar.findMany({
            where: {
                name: "My First Jar"
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                activeJarId: true
                            }
                        }
                    }
                },
                ideas: {
                    select: {
                        id: true
                    }
                }
            }
        });

        console.log(`Found ${myFirstJars.length} jars named "My First Jar"\n`);

        // Filter for orphan jars
        const orphanJars = myFirstJars.filter(jar => {
            // Must have 0 ideas
            if (jar.ideas.length > 0) return false;

            // Must have exactly 1 member
            if (jar.members.length !== 1) return false;

            // That member must be OWNER
            const member = jar.members[0];
            if (member.role !== 'OWNER') return false;

            // User's activeJarId must point to a DIFFERENT jar
            if (member.user.activeJarId === jar.id) return false;

            return true;
        });

        console.log(`📊 Found ${orphanJars.length} orphan jars to clean up:\n`);

        if (orphanJars.length === 0) {
            console.log('✅ No orphan jars found. Database is clean!');
            return;
        }

        // Display orphan jars
        orphanJars.forEach((jar, index) => {
            const member = jar.members[0];
            console.log(`${index + 1}. Jar ID: ${jar.id}`);
            console.log(`   Created: ${jar.createdAt.toISOString()}`);
            console.log(`   Owner: ${member.user.name} (${member.user.email})`);
            console.log(`   Owner's Active Jar: ${member.user.activeJarId}`);
            console.log(`   Ideas: ${jar.ideas.length}`);
            console.log(`   Members: ${jar.members.length}`);
            console.log('');
        });

        if (isDryRun) {
            console.log('🔬 DRY RUN: No changes made. Run without --dry-run to delete these jars.');
            return;
        }

        // Delete orphan jars
        console.log('🗑️  Deleting orphan jars...\n');

        let deletedCount = 0;
        for (const jar of orphanJars) {
            try {
                // Delete in transaction to ensure atomicity
                await prisma.$transaction(async (tx) => {
                    // Delete jar members first (foreign key constraint)
                    await tx.jarMember.deleteMany({
                        where: { jarId: jar.id }
                    });

                    // Delete the jar
                    await tx.jar.delete({
                        where: { id: jar.id }
                    });
                });

                deletedCount++;
                console.log(`✅ Deleted jar ${jar.id} (owner: ${jar.members[0].user.email})`);
            } catch (error) {
                console.error(`❌ Failed to delete jar ${jar.id}:`, error);
            }
        }

        console.log(`\n✅ Successfully deleted ${deletedCount} out of ${orphanJars.length} orphan jars`);

    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

main()
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
