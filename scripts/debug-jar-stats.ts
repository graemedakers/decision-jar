/**
 * DEBUG ACTIVE JAR STATS
 */

import { PrismaClient } from '@prisma/client';

const PRODUCTION_URL = 'postgresql://neondb_owner:npg_2wMQpZiD6WOa@ep-weathered-sun-a7gue54a-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const JAR_ID = 'fa371aee-73d9-4a98-b71e-c52864b8c2d4';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: PRODUCTION_URL
        }
    }
});

async function main() {
    console.log(`🔍 Checking Stats for Jar: ${JAR_ID}`);

    try {
        const jar = await prisma.jar.findUnique({
            where: { id: JAR_ID }
        });

        if (jar) {
            console.log(`Name: ${jar.name}`);
            console.log(`XP: ${(jar as any).xp}`);
            console.log(`Level: ${(jar as any).level}`);

            const ideas = await prisma.idea.count({
                where: { jarId: JAR_ID }
            });
            console.log(`Ideas: ${ideas}`);
        } else {
            console.log('Jar not found');
        }
    } catch (e: any) {
        console.error('Error:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
