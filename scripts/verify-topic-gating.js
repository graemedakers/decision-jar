const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BASE_URL = 'http://localhost:3000';
const EMAIL = 'test-gating@example.com';

async function verifyGating() {
    console.log('Starting Topic Gating Verification...');

    try {
        // 1. Setup - Create User & Key (FREE Tier)
        console.log('Setting up Test User & Key (FREE Tier)...');
        await prisma.apiUsage.deleteMany({ where: { apiKey: { user: { email: EMAIL } } } });
        await prisma.apiKey.deleteMany({ where: { user: { email: EMAIL } } });
        await prisma.user.deleteMany({ where: { email: EMAIL } });

        const user = await prisma.user.create({
            data: { email: EMAIL, name: 'Gating Tester' }
        });

        const key = await prisma.apiKey.create({
            data: {
                key: 'pk_live_gating_test',
                secretHash: 'sk_live_gating_test',
                tier: 'FREE',
                monthlyLimit: 100,
                userId: user.id,
                resetAt: new Date(new Date().setMonth(new Date().getMonth() + 1))
            }
        });

        // 2. Test Allowed Topic (DINING)
        console.log('\n--- Test 1: Allowed Topic (DINING) ---');
        const res1 = await fetch(`${BASE_URL}/api/ideas/generate`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${key.key}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: 'Find me a burger place', location: 'Sydney' })
        });

        if (res1.status === 200) {
            console.log('✅ Success: DINING allowed on Free Tier');
        } else {
            console.error('❌ Failed: DINING blocked on Free Tier', await res1.json());
            process.exit(1);
        }


        // 3. Test Restricted Topic (WEEKEND_EVENTS)
        console.log('\n--- Test 2: Restricted Topic (WEEKEND_EVENTS) ---');
        const res2 = await fetch(`${BASE_URL}/api/ideas/generate`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${key.key}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: 'What is happening this weekend?', location: 'Sydney' })
        });

        if (res2.status === 403) {
            const body = await res2.json();
            if (body.error === 'Upgrade Required') {
                console.log('✅ Success: WEEKEND_EVENTS blocked correctly');
                console.log('Reason:', body.message);
            } else {
                console.error('❌ Failed: 403 returned but wrong reason', body);
                process.exit(1);
            }
        } else {
            console.error(`❌ Failed: Expected 403, got ${res2.status}`, await res2.json());
            process.exit(1);
        }

        console.log('\n🎉 TOPIC GATING VERIFIED!');

    } catch (e) {
        console.error('Verification Error:', e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

verifyGating();
