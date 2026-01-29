import { test, expect } from '@playwright/test';

test.describe('Smart Input UX Improvements', () => {
    test.beforeEach(async ({ page }) => {
        // Force E2E bypass
        await page.setExtraHTTPHeaders({ 'x-e2e-bypass': 'true' });

        // Diagnostic Logging
        page.on('request', request => console.log('>>', request.method(), request.url()));
        page.on('response', response => console.log('<<', response.status(), response.url()));
        page.on('console', msg => console.log('BROWSER:', msg.text()));
    });

    test('should show correct hints and loading states', async ({ page }) => {
        // Set a larger viewport to ensure "Press Enter" is visible
        await page.setViewportSize({ width: 1280, height: 720 });

        const JAR_ID = 'jar-123';
        const USER_ID = 'user-1';

        // 1. Setup Specific Mocks
        await page.route('**/api/auth/session', async route => {
            console.log('Fulfilling /api/auth/session');
            await route.fulfill({
                status: 200,
                json: {
                    user: { id: USER_ID, name: 'Test User', email: 'user@example.com' },
                    expires: new Date(Date.now() + 3600000).toISOString()
                }
            });
        });

        await page.route('**/api/auth/me', async route => {
            console.log('Fulfilling /api/auth/me');
            await route.fulfill({
                status: 200,
                json: {
                    user: {
                        id: USER_ID,
                        name: 'Test User',
                        email: 'user@example.com',
                        activeJarId: JAR_ID,
                        jarName: 'My Jar',
                        jarTopic: 'Food',
                        isPro: false,
                        memberships: [{ jarId: JAR_ID, role: 'ADMIN', jar: { id: JAR_ID, name: 'My Jar', topic: 'Food' } }]
                    }
                }
            });
        });

        await page.route('**/api/user/ai-usage', async route => {
            await route.fulfill({ json: { remaining: 5, dailyLimit: 10, isPro: false } });
        });

        await page.route('**/api/ideas*', async route => {
            await route.fulfill({ json: [] });
        });

        // Suppress modals
        await page.addInitScript((jarId) => {
            window.localStorage.setItem('onboarding_completed_user-1', 'true');
            window.localStorage.setItem(`quickstart_dismissed_${jarId}`, 'true');
            window.localStorage.setItem('jar_quickstart_dismissed', 'true');
        }, JAR_ID);

        console.log('NAVIGATING TO DASHBOARD...');
        await page.goto('/dashboard');

        // Wait for input to be visible
        const input = page.locator('input[type="text"]').first();
        await expect(input).toBeVisible({ timeout: 15000 });

        // 2. Verify "Press Enter" hint is visible initially
        // Use a more relaxed locator for the "Press Enter" text
        const enterHint = page.locator('div:has-text("Press Enter")').filter({ has: page.locator('svg.lucide-corner-down-left') }).first();
        await expect(enterHint).toBeVisible();

        // 3. Type something
        await input.fill('5 cheap eats');
        await expect(enterHint).not.toBeVisible();

        const magicAddBtn = page.getByRole('button', { name: 'Magic Add' });
        await expect(magicAddBtn).toBeVisible();

        // 4. Trigger generation
        await page.route('**/api/intent/classify', async route => {
            await new Promise(resolve => setTimeout(resolve, 2000));
            await route.fulfill({ json: { intent: { intentAction: 'ADD_SINGLE', topic: 'Tacos' } } });
        });

        await input.press('Enter');

        // Verify input is cleared immediately
        await expect(input).toHaveValue('');

        // Verify progress bar appears
        const progressBar = page.locator('div.h-\\[3px\\]').first();
        await expect(progressBar).toBeVisible();

        // Verify button text changed to "Generating..."
        const generatingBtn = page.getByRole('button', { name: 'Generating...' });
        await expect(generatingBtn).toBeVisible();

        // Verify the form has the pulse class
        const form = page.locator('form').filter({ has: input });
        await expect(form).toHaveClass(/active-generating-pulse/);
    });
});
