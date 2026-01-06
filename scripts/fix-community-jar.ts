import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixCommunityJar() {
    try {
        // Find the "Report a Bug or Issue" jar
        const jar = await prisma.jar.findFirst({
            where: {
                name: {
                    contains: 'Report',
                    mode: 'insensitive'
                }
            }
        });

        if (!jar) {
            console.log('❌ Jar not found. Please check the name.');
            return;
        }

        console.log(`Found jar: "${jar.name}" (ID: ${jar.id})`);
        console.log(`Current isCommunityJar: ${jar.isCommunityJar}`);

        if (jar.isCommunityJar) {
            console.log('✅ Jar is already marked as a community jar!');
            return;
        }

        // Update to mark as community jar
        const updated = await prisma.jar.update({
            where: { id: jar.id },
            data: { isCommunityJar: true }
        });

        console.log('✅ Successfully updated jar to community jar!');
        console.log(`New isCommunityJar: ${updated.isCommunityJar}`);
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixCommunityJar();
