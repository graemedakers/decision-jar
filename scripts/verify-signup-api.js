const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Polyfill fetch if node version < 18 (although local env is likely newer)
// If fetch fails, we can use 'http' module but let's assume fetch exists or verify.

async function verify() {
    const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
    const EMAIL = 'api_verify_user@test.com';
    const TOKEN = 'API_TEST_TOKEN_123';
    const JAR_CODE = 'APIJAR';

    console.log(`Starting API Verification against ${BASE_URL}...`);

    try {
        // --- 1. CLEANUP ---
        console.log("Cleaning up previous test data...");
        await prisma.premiumInviteToken.deleteMany({ where: { token: TOKEN } });
        await prisma.jar.deleteMany({ where: { referenceCode: JAR_CODE } });
        await prisma.user.deleteMany({ where: { email: EMAIL } });
        await prisma.user.deleteMany({ where: { email: 'api_admin@test.com' } });

        // --- 2. SEEDING ---
        console.log("Seeding Database...");
        const admin = await prisma.user.create({
            data: {
                email: 'api_admin@test.com',
                name: 'API Admin',
                isSuperAdmin: true,
                verificationToken: 'dummy'
            }
        });

        await prisma.premiumInviteToken.create({
            data: {
                token: TOKEN,
                createdById: admin.id,
                maxUses: 5,
                isActive: true,
                expiresAt: new Date(Date.now() + 86400000)
            }
        });

        await prisma.jar.create({
            data: {
                name: 'API verification Jar',
                referenceCode: JAR_CODE,
                type: 'SOCIAL',
                selectionMode: 'RANDOM',
                topic: 'General',
                members: { create: [] }
            }
        });
        console.log("Seeding complete.");

        // --- 3. API REQUEST ---
        const payload = {
            name: 'API Test User',
            email: EMAIL,
            password: 'password123',
            inviteCode: JAR_CODE,
            premiumToken: TOKEN
        };

        console.log("Sending POST to /api/auth/signup...");
        const response = await fetch(`${BASE_URL}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const status = response.status;
        const body = await response.json();

        console.log(`Response Status: ${status}`);
        console.log(`Response Body:`, JSON.stringify(body, null, 2));

        if (status !== 200) {
            throw new Error(`API returned ${status}: ${JSON.stringify(body)}`);
        }

        if (body.premiumGifted !== true) {
            throw new Error("❌ FAILURE: premiumGifted should be true in response");
        }
        console.log("✅ API Response confirms premiumGifted: true");

        // --- 4. DB VERIFICATION ---
        console.log("Verifying Database State...");
        const user = await prisma.user.findUnique({ where: { email: EMAIL } });

        if (!user) throw new Error("❌ FAILURE: User not created in DB");
        if (user.isLifetimePro !== true) throw new Error("❌ FAILURE: User.isLifetimePro is false");
        console.log("✅ User has isLifetimePro: true");

        const tokenRecord = await prisma.premiumInviteToken.findUnique({ where: { token: TOKEN } });
        if (tokenRecord.currentUses !== 1) throw new Error(`❌ FAILURE: Token uses is ${tokenRecord.currentUses}, expected 1`);
        if (tokenRecord.usedById !== user.id) throw new Error("❌ FAILURE: Token usedById mismatch");
        console.log("✅ Token usage recorded correctly");

        console.log("🎉 SUCCESS: All verifications passed!");

    } catch (e) {
        console.error("Test Failed:", e);
        process.exit(1);
    } finally {
        // Optional Cleanup (commented out to debug if needed)
        // await prisma.user.deleteMany({ where: { email: EMAIL } });
        await prisma.$disconnect();
    }
}

verify();
