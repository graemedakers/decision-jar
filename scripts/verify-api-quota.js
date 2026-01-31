const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
    const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
    const EMAIL = 'api_quota_test@example.com';
    const API_KEY = 'sk_live_TEST_QUOTA_KEY_123';

    console.log(`Starting API Quota Verification against ${BASE_URL}...`);

    try {
        // --- 1. CLEANUP ---
        console.log("Cleaning up previous test data...");
        await prisma.apiKey.deleteMany({ where: { key: API_KEY } });
        await prisma.user.deleteMany({ where: { email: EMAIL } });

        // --- 2. SEEDING ---
        console.log("Seeding Database...");
        const user = await prisma.user.create({
            data: {
                email: EMAIL,
                name: 'Quota Test User',
                isSuperAdmin: false
            }
        });

        const MONTHLY_LIMIT = 3;

        await prisma.apiKey.create({
            data: {
                key: API_KEY,
                secretHash: 'legacy_mode',
                tier: 'TEST',
                monthlyLimit: MONTHLY_LIMIT,
                userId: user.id,
                resetAt: new Date(new Date().setMonth(new Date().getMonth() + 1)),
                isActive: true
            }
        });
        console.log(`Seeded API Key with limit: ${MONTHLY_LIMIT}`);

        // --- 3. EXECUTING CALLS ---
        // We will make 4 calls. 
        // 1-3 should succeed (200).
        // 4 should fail (403/429).

        for (let i = 1; i <= 4; i++) {
            console.log(`\n--- Request ${i} ---`);
            const response = await fetch(`${BASE_URL}/api/ideas/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    query: 'Suggest a fun activity',
                    location: 'Test City',
                    isDemo: false
                })
            });

            const status = response.status;
            console.log(`Status: ${status}`);

            if (i <= MONTHLY_LIMIT) {
                if (status === 200) {
                    console.log("✅ Success (Expected)");
                } else {
                    const txt = await response.text();
                    console.error(`❌ FAILED: Expected 200, got ${status}. Body: ${txt}`);
                    throw new Error("Request failed unexpectedly");
                }
            } else {
                if (status === 403 || status === 429) {
                    console.log("✅ Blocked (Expected)");
                    const json = await response.json();
                    console.log(`Block Reason: ${json.message}`);
                } else {
                    console.error(`❌ FAILED: Expected 403/429, got ${status}`);
                    throw new Error("Quota enforcement failed");
                }
            }
        }

        // --- 4. VERIFY DB USAGE ---
        const keyRecord = await prisma.apiKey.findUnique({
            where: { key: API_KEY },
            include: { usageLogs: true }
        });

        console.log(`\nDB Usage Count: ${keyRecord.usedThisMonth}`);
        console.log(`Usage Logs: ${keyRecord.usageLogs.length}`);

        if (keyRecord.usedThisMonth !== MONTHLY_LIMIT) {
            console.warn(`WARNING: UsedThisMonth (${keyRecord.usedThisMonth}) != Limit (${MONTHLY_LIMIT}). Did the blocked request increment it? (Should not)`);
        }

        // --- 5. CLEANUP ---
        console.log("\nCleaning up...");
        await prisma.apiKey.deleteMany({ where: { key: API_KEY } });
        await prisma.user.deleteMany({ where: { email: EMAIL } });

        console.log("🎉 SUCCESS: Quota verification passed!");

    } catch (e) {
        console.error("Test Failed:", e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

verify();
