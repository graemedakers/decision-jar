/**
 * DEBUG PRODUCTION AUTH/ME LOGIC
 * Simulates the /api/auth/me logic on the production database
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
    console.log(`🔍 Debugging /api/auth/me for ${USER_EMAIL} on PRODUCTION`);
    console.log('='.repeat(60));

    try {
        // 1. Find User
        const user = await prisma.user.findUnique({
            where: { email: USER_EMAIL },
            include: {
                memberships: {
                    include: {
                        jar: {
                            select: {
                                id: true,
                                name: true,
                                type: true,
                                topic: true,
                                selectionMode: true,
                                customCategories: true,
                                imageUrl: true,
                                description: true
                            }
                        }
                    }
                }
            }
        });

        if (!user) {
            console.log('❌ User not found');
            return;
        }

        console.log(`✅ User found: ${user.id}`);
        console.log(`📊 Stats: XP=${user.xp}, Level=${user.level}`);
        console.log(`🏺 Active Jar ID: ${user.activeJarId}`);
        console.log(`👥 Membership count: ${user.memberships.length}`);

        // 2. Resolve Active Jar
        const activeJarId = user.activeJarId || user.memberships[0]?.jarId;

        if (!activeJarId) {
            console.log('⚠️ No active jar found for user');
        } else {
            console.log(`🎯 Targeted Jar ID: ${activeJarId}`);

            // Check if the jar actually exists and what columns it has
            try {
                const jarData = await prisma.$queryRawUnsafe<any[]>(
                    `SELECT * FROM "Jar" WHERE id = $1`,
                    activeJarId
                );

                if (jarData.length === 0) {
                    console.log('❌ Active jar NOT FOUND in database');
                } else {
                    console.log('✅ Active jar data retrieved via raw query');
                    const columns = Object.keys(jarData[0]);
                    console.log('📋 Columns present in Jar table:', columns.join(', '));

                    if (columns.includes('isCommunityJar')) {
                        console.log('🚨 ALERT: isCommunityJar STILL EXISTS IN PRODUCTION DB');
                    }
                    if (columns.includes('isGloballyAccessible')) {
                        console.log('🚨 ALERT: isGloballyAccessible STILL EXISTS IN PRODUCTION DB');
                    }
                }

                // Check Prisma fetch
                const activeJar = await prisma.jar.findUnique({
                    where: { id: activeJarId }
                });
                console.log('✅ Active jar fetched via Prisma:', activeJar?.name);
            } catch (e: any) {
                console.log('❌ Error fetching jarring info:', e.message);
            }
        }

        // 3. Check Subscription Status
        console.log(`💳 Subscription Status: ${user.subscriptionStatus}`);

    } catch (error: any) {
        console.error('❌ CRITICAL ERROR:', error.message);
        if (error.code) console.log('Prisma Error Code:', error.code);
    } finally {
        await prisma.$disconnect();
    }
}

main();
