
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- DIAGNOSTIC START ---');
    try {
        console.log('1. Connecting to database...');
        await prisma.$connect();
        console.log('   ✅ Connected.');

        console.log('2. checking for specific user (graemedakers@gmail.com)...');
        const user = await prisma.user.findUnique({
            where: { email: 'graemedakers@gmail.com' },
            include: {
                memberships: { include: { jar: true } }
            }
        });

        if (user) {
            console.log('   ✅ User found:', user.email);
            console.log('   User ID:', user.id);
            console.log('   Active Jar ID:', user.activeJarId);
            console.log('   Memberships:', user.memberships.length);
            user.memberships.forEach(m => {
                console.log(`     - Jar: ${m.jar.name} (${m.jar.id})`);
            });
        } else {
            console.log('   ❌ User NOT found.');

            // List ANY users
            const count = await prisma.user.count();
            console.log(`   Total users in DB: ${count}`);
        }

    } catch (error) {
        console.error('❌ FATAL ERROR:', error);
    } finally {
        await prisma.$disconnect();
        console.log('--- DIAGNOSTIC END ---');
    }
}

main();
