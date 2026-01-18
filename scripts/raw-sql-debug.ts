/**
 * RAW SQL DEBUG OF PRODUCTION DATA (Corrected)
 */

import { PrismaClient } from '@prisma/client';

const PRODUCTION_URL = 'postgresql://neondb_owner:npg_2wMQpZiD6WOa@ep-weathered-sun-a7gue54a-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const USER_EMAIL = 'graemedakers@gmail.com';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: PRODUCTION_URL
        }
    }
});

async function main() {
    console.log(`🔍 Raw SQL Debug for ${USER_EMAIL}`);

    try {
        // Find User
        const users = await prisma.$queryRawUnsafe<any[]>(
            `SELECT id, name, "activeJarId" FROM "User" WHERE email = $1`,
            USER_EMAIL
        );

        if (users.length === 0) {
            console.log('User not found');
            return;
        }

        const user = users[0];
        console.log(`User: ${user.name} (ID: ${user.id})`);
        console.log(`Active Jar ID: ${user.activeJarId}`);

        // Find members and their jars
        const memberships = await prisma.$queryRawUnsafe<any[]>(
            `SELECT j.id, j.name, j.xp, j.level, m.role 
             FROM "Jar" j
             JOIN "JarMember" m ON j.id = m."jarId"
             WHERE m."userId" = $1`,
            user.id
        );

        console.log('\nMemberships:');
        memberships.forEach(m => {
            console.log(`- ${m.name} (XP: ${m.xp}, Level: ${m.level}, Role: ${m.role})`);
        });

    } catch (e: any) {
        console.error('❌ SQL FAILED:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
