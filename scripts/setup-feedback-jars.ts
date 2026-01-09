import { prisma } from '../lib/prisma';

/**
 * Script to create community feedback jars and add all users to them
 * 
 * Creates two jars:
 * 1. Bug Reports - For users to report issues
 * 2. Feature Requests - For users to suggest improvements
 * 
 * All existing and future users will be automatically added as members
 */

async function createFeedbackJars() {
    console.log('🚀 Starting feedback jars setup...\n');

    try {
        // Check if jars already exist
        const existingBugJar = await prisma.jar.findFirst({
            where: { referenceCode: 'BUGRPT' }
        });

        const existingFeatureJar = await prisma.jar.findFirst({
            where: { referenceCode: 'FEATREQ' }
        });

        let bugJar = existingBugJar;
        let featureJar = existingFeatureJar;

        // Create or Update Bug Reports Jar
        if (!bugJar) {
            console.log('📝 Creating Bug Reports jar...');
            bugJar = await prisma.jar.create({
                data: {
                    referenceCode: 'BUGRPT',
                    name: '🐛 Bug Reports',
                    topic: 'Bug Reports',
                    type: 'SOCIAL',
                    location: 'Global',
                    isPremium: true,
                    isCommunityJar: true, // Community jar
                    selectionMode: 'RANDOM',
                    isTrialEligible: false
                }
            });
            console.log(`✅ Bug Reports jar created (ID: ${bugJar.id})`);
        } else {
            console.log(`ℹ️  Bug Reports jar exists - Updating flags...`);
            bugJar = await prisma.jar.update({
                where: { id: bugJar.id },
                data: { isCommunityJar: true }
            });
        }

        // Create or Update Feature Requests Jar
        if (!featureJar) {
            console.log('📝 Creating Feature Requests jar...');
            featureJar = await prisma.jar.create({
                data: {
                    referenceCode: 'FEATREQ',
                    name: '💡 Feature Requests',
                    topic: 'Feature Requests',
                    type: 'SOCIAL',
                    location: 'Global',
                    isPremium: true,
                    isCommunityJar: true, // Community jar
                    selectionMode: 'RANDOM',
                    isTrialEligible: false
                }
            });
            console.log(`✅ Feature Requests jar created (ID: ${featureJar.id})`);
        } else {
            console.log(`ℹ️  Feature Requests jar exists - Updating flags...`);
            featureJar = await prisma.jar.update({
                where: { id: featureJar.id },
                data: { isCommunityJar: true }
            });
        }

        // Get all users
        console.log('\n👥 Fetching all users...');
        const allUsers = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                memberships: {
                    select: {
                        jarId: true
                    }
                }
            }
        });

        console.log(`Found ${allUsers.length} users\n`);

        // Add users to jars
        let bugJarAdded = 0;
        let featureJarAdded = 0;
        let bugJarSkipped = 0;
        let featureJarSkipped = 0;

        for (const user of allUsers) {
            const existingJarIds = user.memberships.map(m => m.jarId);

            // Add to Bug Reports jar if not already a member
            if (!existingJarIds.includes(bugJar.id)) {
                await prisma.jarMember.create({
                    data: {
                        userId: user.id,
                        jarId: bugJar.id,
                        role: 'MEMBER'
                    }
                });
                bugJarAdded++;
                console.log(`✅ Added ${user.name} (${user.email}) to Bug Reports`);
            } else {
                bugJarSkipped++;
            }

            // Add to Feature Requests jar if not already a member
            if (!existingJarIds.includes(featureJar.id)) {
                await prisma.jarMember.create({
                    data: {
                        userId: user.id,
                        jarId: featureJar.id,
                        role: 'MEMBER'
                    }
                });
                featureJarAdded++;
                console.log(`✅ Added ${user.name} (${user.email}) to Feature Requests`);
            } else {
                featureJarSkipped++;
            }
        }

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 SUMMARY');
        console.log('='.repeat(60));
        console.log(`\n🐛 Bug Reports Jar (${bugJar.referenceCode}):`);
        console.log(`   - New members added: ${bugJarAdded}`);
        console.log(`   - Already members: ${bugJarSkipped}`);
        console.log(`   - Total members: ${bugJarAdded + bugJarSkipped}`);

        console.log(`\n💡 Feature Requests Jar (${featureJar.referenceCode}):`);
        console.log(`   - New members added: ${featureJarAdded}`);
        console.log(`   - Already members: ${featureJarSkipped}`);
        console.log(`   - Total members: ${featureJarAdded + featureJarSkipped}`);

        console.log('\n✨ Setup complete!');
        console.log('\n📝 Next Steps:');
        console.log('   1. Update signup route to auto-add new users');
        console.log('   2. Users can now report bugs and request features');
        console.log('   3. Jar codes: BUGRPT (bugs), FEATREQ (features)\n');

        return {
            bugJarId: bugJar.id,
            featureJarId: featureJar.id,
            bugJarCode: bugJar.referenceCode,
            featureJarCode: featureJar.referenceCode
        };

    } catch (error) {
        console.error('❌ Error setting up feedback jars:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
createFeedbackJars()
    .then((result) => {
        console.log('✅ Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Script failed:', error);
        process.exit(1);
    });
