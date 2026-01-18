/**
 * FINAL PRE-VERIFICATION OF AUTH/ME LOGIC
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
    console.log('🔍 Simulating /api/auth/me fetching logic...');

    try {
        const user = await prisma.user.findFirst({
            where: { email: { equals: USER_EMAIL, mode: 'insensitive' } },
            include: {
                memberships: {
                    include: {
                        jar: {
                            include: {
                                members: {
                                    include: { user: { select: { id: true, name: true } } }
                                },
                                achievements: true
                            }
                        }
                    }
                }
            },
        });

        if (!user) {
            console.log('User not found');
            return;
        }

        console.log('✅ User and memberships fetched successfully');
        const activeJar = user.memberships[0]?.jar;

        if (activeJar) {
            console.log(`Active Jar: ${activeJar.name}`);
            console.log(`XP: ${(activeJar as any).xp}`);
            console.log(`Ideas count: ${activeJar.ideas?.length ?? 'N/A (not fetched here)'}`);
        }

    } catch (e: any) {
        console.error('❌ FETCH FAILED:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
