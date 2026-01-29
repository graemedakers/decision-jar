import { test, expect } from '@playwright/test';

test.describe('Jar Management', () => {
    test.beforeEach(async ({ page }) => {
        // Bypass middleware redirect
        await page.setExtraHTTPHeaders({ 'x-e2e-bypass': 'true' });

        // Initialize localStorage to suppress onboarding/modals
        await page.addInitScript(() => {
            window.localStorage.setItem('jar_quick_start_seen', 'true');
            window.localStorage.setItem('onboarding_tour_completed', 'true');
            window.localStorage.setItem('premium_shortcuts_tip_seen', 'true');
            window.localStorage.setItem('trial_modal_dismissed_at', Date.now().toString());
            window.localStorage.setItem('last_snoozed_trial_modal', Date.now().toString());
            window.localStorage.setItem('has_seen_mystery_mode_intro', 'true');
            window.localStorage.setItem('has_dismissed_rate_app', 'true');
            window.localStorage.setItem('has_seen_welcome_v2', 'true');
        });

        // Manual Auth Mocks
        await page.route(/\/api\/auth\/session/, async route => {
            await route.fulfill({
                json: {
                    user: { id: 'user-1', name: 'Admin User', email: 'admin@example.com' },
                    expires: new Date(Date.now() + 3600000).toISOString()
                }
            });
        });

        await page.route(/\/api\/auth\/me/, async route => {
            await route.fulfill({
                json: {
                    user: {
                        id: 'user-1',
                        name: 'Admin User',
                        email: 'admin@example.com',
                        activeJarId: 'jar-1',
                        isPremium: true,
                        isCreator: true,
                        memberships: [
                            {
                                jarId: 'jar-1',
                                role: 'OWNER',
                                jar: { id: 'jar-1', name: 'Test Jar', type: 'SOCIAL', topic: 'General' }
                            }
                        ]
                    }
                }
            });
        });

        await page.route('**/api/jars/list', async route => {
            await route.fulfill({
                json: [
                    { id: 'jar-1', name: 'Test Jar', role: 'OWNER', memberCount: 3, ideaCount: 10, createdAt: new Date().toISOString(), topic: 'General', referenceCode: 'ABC-123' }
                ]
            });
        });

        await page.route('**/api/ideas*', async route => {
            await route.fulfill({
                json: [{ id: 'idea-1', name: 'Existing Idea', description: 'Test', type: 'RESTAURANT', ideaType: 'RESTAURANT' }]
            });
        });

        await page.route('**/api/favorites*', async route => {
            await route.fulfill({ json: [] });
        });

        await page.route('**/api/user/ai-usage', async route => {
            await route.fulfill({ json: { remaining: 10, dailyLimit: 10, isPro: true } });
        });

        await page.route('**/api/user/trial-stats', async route => {
            await route.fulfill({ json: { conciergeUses: 5, ideasCreated: 10, daysActive: 3 } });
        });

        await page.route('**/api/reviews', async route => {
            await route.fulfill({ json: [] });
        });

        await page.route('**/api/jars/jar-1', async route => {
            if (route.request().method() === 'GET') {
                await route.fulfill({
                    json: { id: 'jar-1', name: 'Test Jar', isGiftable: true, _count: { ideas: 10 }, members: [{}, {}, {}], isMysteryMode: false }
                });
            } else { await route.continue(); }
        });

        // Navigate
        await page.goto('/dashboard?jarId=jar-1');
        await page.waitForLoadState('networkidle');

        // Final fallback for identifying the header buttons
        await page.waitForSelector('button[aria-label="Settings"]', { timeout: 30000 });
    });

    test('should allow admin to rename jar via Manager Modal', async ({ page }) => {
        // 1. Open Jar Switcher
        await page.locator('button[data-tour="jar-selector"]').click({ force: true });
        await page.waitForTimeout(500);

        // 2. Click "Manage My Jars"
        await page.locator('button:has-text("Manage My Jars")').click({ force: true });
        await page.waitForTimeout(1000);

        // 3. Verify Modal Open
        await expect(page.locator('text=Manage Your Jars')).toBeVisible();

        // 4. Mock Rename API
        let renamePayload: any = null;
        await page.route('**/api/jars/jar-1', async route => {
            if (route.request().method() === 'PUT') {
                renamePayload = route.request().postDataJSON();
                await route.fulfill({ json: { success: true } });
            } else { await route.continue(); }
        });

        // 5. Click Rename (Pencil Icon)
        await page.locator('button:has-text("Rename")').first().click({ force: true });
        await page.waitForTimeout(300);

        // 6. Enter new name
        const input = page.locator('input[type="text"]').last();
        await input.fill('Renamed Jar');
        await input.press('Enter');

        // 7. Verify API Call
        expect(renamePayload).toBeTruthy();
        expect(renamePayload.name).toBe('Renamed Jar');

        // 8. Verify UI Update
        await expect(page.locator('text=Jar renamed successfully')).toBeVisible();
    });

    test('should allow admin to manage members', async ({ page }) => {
        await page.route('**/api/jars/jar-1/members', async route => {
            await route.fulfill({
                json: {
                    members: [
                        { userId: 'user-1', role: 'OWNER', user: { id: 'user-1', name: 'Admin User', email: 'admin@example.com' } },
                        { userId: 'user-2', role: 'MEMBER', user: { id: 'user-2', name: 'Member User', email: 'member@example.com' } }
                    ],
                    referenceCode: 'ABC-123'
                }
            });
        });

        await page.locator('button[data-tour="jar-selector"]').click({ force: true });
        await page.waitForTimeout(500);
        await page.locator('button:has-text("Manage My Jars")').click({ force: true });
        await page.waitForTimeout(1000);

        // 2. Click "Members" on the jar card
        await page.locator('button:has-text("Members")').first().click({ force: true });
        await page.waitForTimeout(1000);

        // 3. Verify Members Modal
        await expect(page.locator('text=Jar Members')).toBeVisible();
        await expect(page.locator('text=Member User')).toBeVisible();

        // 4. Mock Promote API
        let promotePayload: any = null;
        await page.route('**/api/jars/jar-1/members/user-2', async route => {
            if (route.request().method() === 'PATCH') {
                promotePayload = route.request().postDataJSON();
                await route.fulfill({ json: { success: true } });
            } else { await route.continue(); }
        });

        // 5. Open Action Menu for Member User
        const memberRow = page.locator('div', { hasText: 'Member User' }).last();
        await memberRow.locator('button').last().click({ force: true });
        await page.waitForTimeout(300);

        // 6. Promote to Admin
        await page.locator('button:has-text("Promote to Admin")').click({ force: true });

        // 7. Verify Request
        expect(promotePayload).toBeTruthy();
        expect(promotePayload.role).toBe('ADMIN');

        // 8. Verify Toast
        await expect(page.locator('text=is now an admin')).toBeVisible();
    });

    test('should allow admin to empty jar via Settings', async ({ page }) => {
        // 1. Click Settings Icon in Header
        await page.locator('button[aria-label="Settings"]').first().click({ force: true });
        await page.waitForTimeout(1000);

        // 2. Switch to "Jar Settings" Tab (since we are Admin)
        await page.locator('button:has-text("Jar Settings")').click({ force: true });
        await page.waitForTimeout(1000);

        // 3. Scroll to Danger Zone and Click Empty Jar
        await page.locator('button:has-text("Empty Jar")').first().click({ force: true });
        await page.waitForTimeout(500);

        // 4. Mock Reset API
        let resetCalled = false;
        await page.route('**/api/jars/jar-1/reset', async route => {
            resetCalled = true;
            await route.fulfill({ json: { message: 'Jar emptied successfully!' } });
        });

        // 5. Confirm Dialog
        await expect(page.locator('text=Are you sure you want to empty this jar?')).toBeVisible();
        await page.locator('button:has-text("Empty Jar")').last().click({ force: true });

        // 6. Verify API Call & Success
        expect(resetCalled).toBe(true);
        await expect(page.locator('text=Jar emptied successfully!')).toBeVisible();
    });
});
