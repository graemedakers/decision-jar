/**
 * DEBUG PRODUCTION DATABASE INTEGRITY
 */

import { PrismaClient } from '@prisma/client';

const PRODUCTION_URL = 'postgresql://neondb_owner:npg_2wMQpZiD6WOa@ep-weathered-sun-a7gue54a-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: PRODUCTION_URL
        }
    }
});

async function main() {
    console.log('🔍 Checking PRODUCTION Jar table columns...');

    try {
        const columns = await prisma.$queryRaw<any[]>`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'Jar'
        `;

        const columnNames = columns.map(c => c.column_name);
        console.log('Columns found:', columnNames.join(', '));

        const hasCommunity = columnNames.includes('isCommunityJar');
        const hasGlobal = columnNames.includes('isGloballyAccessible');

        console.log(`isCommunityJar: ${hasCommunity ? '❌ EXISTS' : '✅ REMOVED'}`);
        console.log(`isGloballyAccessible: ${hasGlobal ? '❌ EXISTS' : '✅ REMOVED'}`);

        // Check a specific user
        const userEmail = 'graemedakers@gmail.com';
        const user = await prisma.user.findUnique({
            where: { email: userEmail },
            include: {
                memberships: {
                    include: {
                        jar: {
                            select: { id: true, name: true }
                        }
                    }
                }
            }
        });

        if (user) {
            console.log(`\nUser: ${user.name} (${user.email})`);
            console.log(`Active Jar ID: ${user.activeJarId}`);
            console.log('Memberships:');
            user.memberships.forEach(m => {
                console.log(`  - ${m.jar.name} (ID: ${m.jar.id}, Role: ${m.role})`);
            });

            if (user.activeJarId) {
                const ideasCount = await prisma.idea.count({
                    where: { jarId: user.activeJarId }
                });
                console.log(`\nIdeas in active jar: ${ideasCount}`);
            }
        } else {
            console.log(`\nUser ${userEmail} not found`);
        }

    } catch (e: any) {
        console.error('Error:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
