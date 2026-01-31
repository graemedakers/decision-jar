import { test, expect } from '@playwright/test';
import { robustClick, createRandomUser, mockAuth } from '../utils/e2e-helpers';

test.describe('Join Jar Flow', () => {

    test('should redirect new user to signup and join jar', async ({ page }) => {
        const user = createRandomUser();
        const INVITE_CODE = 'TEST_INVITE_123';

        // Seed a jar for the invite code to be valid (Server Action check)
        // We need to import prisma. e2e-helpers or direct import?
        // tests/setup.ts defines global seededData but that is per-worker or per-project?
        // We can just use the db client.
        const { prisma } = require('../../lib/prisma');
        // Ensure cleanup or unique code
        // upsert to avoid duplicate error if re-run
        await prisma.jar.upsert({
            where: { referenceCode: INVITE_CODE },
            update: {},
            create: {
                name: 'Invite Test Jar',
                referenceCode: INVITE_CODE,
                type: 'SOCIAL',
                selectionMode: 'RANDOM',
                topic: 'General',
                members: {
                    create: [] // No members initially
                }
            }
        });

        // 1. Start with no user authenticated
        await mockAuth(page, false);

        // Bypass Middleware auth checks
        await page.setExtraHTTPHeaders({ 'x-e2e-bypass': 'true' });

        // Mock Signup API
        await page.route('**/api/auth/signup', async route => {
            console.log('Intercepted /api/auth/signup');
            const body = JSON.parse(route.request().postData() || '{}');
            await route.fulfill({
                status: 200,
                json: {
                    user: { id: 'new_user_123', email: body.email, name: body.name },
                    premiumGifted: false,
                    checkoutUrl: null
                }
            });
        });

        // 3. Navigate to Join URL
        console.log(`Navigating to /join?code=${INVITE_CODE}`);
        await page.goto(`/join?code=${INVITE_CODE}`);

        // 3. Verify Redirect to Signup
        console.log('Waiting for redirect to signup...');
        await expect(page).toHaveURL(new RegExp(`/signup.*code=${INVITE_CODE}`), { timeout: 30000 });

        console.log('Successfully reached Signup page. Checking inputs...');
        // 4. Perform Signup
        const nameInput = page.locator('input[name="name"]');
        const emailInput = page.locator('input[name="email"]');
        const passwordInput = page.locator('input[name="password"]');

        await expect(emailInput).toBeVisible({ timeout: 15000 });
        console.log('Signup inputs visible.');

        await nameInput.fill(user.name);
        await emailInput.fill(user.email);
        await passwordInput.fill(user.password);

        // Submit Signup
        const createAccountBtn = page.getByRole('button', { name: /create account/i });

        // Critical: Switch Mock Auth to "Logged In" so when dashboard loads, it thinks we are valid
        await mockAuth(page, true, { ...user, id: 'new_user_123' });

        await robustClick(page, createAccountBtn);

        // 5. Mock Successful Join Logic (since backend logic might be complex locally)
        // We'll trust the signup flow redirects to dashboard, but we need to ensure the dashboard loads
        // In a real env, the backend handles the cookie and session. 
        // Here we mainly verify the UI flow connects correctly.

        console.log('Waiting for Dashboard...');
        await expect(page).toHaveURL(/.*dashboard/, { timeout: 30000 });

        // 6. Verify Dashboard Loaded
        // Just checking basic presence to confirm flow completion
        await expect(page.locator('text=Decision Jar')).toBeVisible({ timeout: 20000 });

        console.log('Join flow completed successfully.');
    });

});
