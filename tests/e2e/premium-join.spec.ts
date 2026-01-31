import { test, expect } from '@playwright/test';
import { robustClick, createRandomUser, mockAuth } from '../utils/e2e-helpers';
import { prisma } from '../../lib/prisma'; // Direct DB access for validation

test.describe('Premium Token Join Flow (Regression Test)', () => {

    test('should grant lifetime premium when joining with a valid premium token', async ({ page }) => {
        test.setTimeout(60000); // 60s timeout for cold start
        const user = createRandomUser();
        const INVITE_CODE = 'PREMIUM_TEST_JAR';
        const PREMIUM_TOKEN = 'PRO_12345';

        // 1. Setup: Clean previous data to avoid collisions
        await prisma.premiumInviteToken.deleteMany({ where: { token: PREMIUM_TOKEN } });
        await prisma.jar.deleteMany({ where: { referenceCode: INVITE_CODE } });
        await prisma.user.deleteMany({ where: { email: user.email } });

        // 2. Seed a valid Jar
        await prisma.jar.create({
            data: {
                name: 'Premium Test Jar',
                referenceCode: INVITE_CODE,
                type: 'SOCIAL',
                selectionMode: 'RANDOM',
                topic: 'General',
                members: { create: [] }
            }
        });

        // 3. Seed a valid Premium Token
        // Create a dummy admin user first to own the token
        const adminUser = await prisma.user.upsert({
            where: { email: 'admin@test.com' },
            create: { email: 'admin@test.com', name: 'Admin', isSuperAdmin: true },
            update: {}
        });

        await prisma.premiumInviteToken.create({
            data: {
                token: PREMIUM_TOKEN,
                createdById: adminUser.id,
                maxUses: 10,
                currentUses: 0,
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours from now
                isActive: true
            }
        });

        // 4. Start with no user authenticated
        await mockAuth(page, false);
        await page.setExtraHTTPHeaders({ 'x-e2e-bypass': 'true' });

        // 5. Navigate to Join URL with Premium Token
        const joinUrl = `/join?code=${INVITE_CODE}&premiumToken=${PREMIUM_TOKEN}`;
        console.log(`Navigating to ${joinUrl}`);
        await page.goto(joinUrl);

        // 6. Verify Redirect to Signup containing the token
        // Use a more generic regex for the URL to be robust
        await expect(page).toHaveURL(/\/signup/, { timeout: 30000 });
        const url = page.url();
        expect(url).toContain(`code=${INVITE_CODE}`);
        expect(url).toContain(`premiumToken=${PREMIUM_TOKEN}`);

        console.log('Successfully reached Signup page. Filling form...');

        // 7. Perform Signup
        await page.locator('input[name="name"]').fill(user.name);
        await page.locator('input[name="email"]').fill(user.email);
        await page.locator('input[name="password"]').fill(user.password);

        // 8. Submit Signup (REAL submission, no route mocking)
        const createAccountBtn = page.getByRole('button', { name: /create account/i });
        await robustClick(page, createAccountBtn);

        // 9. Wait for navigation to Dashboard
        await expect(page).toHaveURL(/.*dashboard/, { timeout: 30000 });
        await expect(page.locator('text=Decision Jar')).toBeVisible({ timeout: 20000 });

        // 10. CRITICAL: Verify Database State
        const dbUser = await prisma.user.findUnique({
            where: { email: user.email }
        });

        expect(dbUser).not.toBeNull();
        expect(dbUser?.isLifetimePro).toBe(true); // Must be upgraded
        console.log('Verified: User is Lifetime Pro');

        // 11. Verify Token Usage
        const dbToken = await prisma.premiumInviteToken.findUnique({
            where: { token: PREMIUM_TOKEN }
        });
        expect(dbToken?.currentUses).toBe(1);
        expect(dbToken?.usedById).toBe(dbUser?.id);
        console.log('Verified: Token usage recorded');
    });
});
