import { test, expect } from '@playwright/test';

test.describe('Favorites System', () => {

    test.beforeEach(async ({ page }) => {
        // Bypass middleware
        await page.setExtraHTTPHeaders({ 'x-e2e-bypass': 'true' });

        // Suppress modals
        await page.addInitScript(() => {
            window.localStorage.setItem('onboarding_completed_user-1', 'true');
            window.localStorage.setItem('jar_quick_start_seen', 'true');
            window.localStorage.setItem('quickstart_dismissed_jar-1', 'true');
            window.localStorage.setItem('onboarding_tour_completed', 'true');
            window.localStorage.setItem('premium_shortcuts_tip_seen', 'true');
            window.localStorage.setItem('trial_modal_dismissed_at', new Date().toISOString());
            window.localStorage.setItem('last_snoozed_trial_modal', new Date().toISOString());
            window.localStorage.setItem('has_seen_mystery_mode_intro', 'true');
            window.localStorage.setItem('has_dismissed_rate_app', 'true');
            window.localStorage.setItem('has_seen_welcome_v2', 'true');
        });

        // Mock Auth
        await page.route(/\/api\/auth\/session/, async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                json: {
                    user: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
                    expires: new Date(Date.now() + 3600000).toISOString()
                }
            });
        });

        await page.route(/\/api\/auth\/me/, async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                json: {
                    user: {
                        id: 'user-1',
                        name: 'Test User',
                        email: 'test@example.com',
                        activeJarId: 'jar-1',
                        isPremium: true,
                        isPro: true,
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

        // Mock Jars
        await page.route(/\/api\/jars\/list/, async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                json: [{ id: 'jar-1', name: 'Test Jar', topic: 'General', role: 'OWNER' }]
            });
        });

        await page.route(/\/api\/jars\/jar-1/, async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                json: { id: 'jar-1', name: 'Test Jar', topic: 'General', _count: { ideas: 2 } }
            });
        });

        // Mock Ideas
        await page.route(/\/api\/ideas$/, async route => {
            if (route.request().method() === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    json: [
                        { id: 'idea-1', description: 'Great Pizza Place', name: 'Pizza', category: 'MEAL', canEdit: true },
                        { id: 'idea-2', description: 'Fun Movie Night', name: 'Movie', category: 'ACTIVITY', canEdit: true }
                    ]
                });
            } else {
                await route.continue();
            }
        });

        // Additional Stability Mocks
        await page.route(/\/api\/user\/ai-usage/, async route => {
            await route.fulfill({ status: 200, contentType: 'application/json', json: { remaining: 10, dailyLimit: 10, isPro: true } });
        });
        await page.route(/\/api\/user\/trial-stats/, async route => {
            await route.fulfill({ status: 200, contentType: 'application/json', json: { conciergeUses: 5, ideasCreated: 10, daysActive: 3 } });
        });
        await page.route(/\/api\/reviews\/check/, async route => {
            await route.fulfill({ status: 200, contentType: 'application/json', json: { shouldShow: false } });
        });
        await page.route(/\/api\/reviews/, async route => {
            await route.fulfill({ status: 200, contentType: 'application/json', json: [] });
        });
    });

    test('should favorite an idea from Jar view', async ({ page }) => {
        // Stateful mock for favorites
        let favorites: any[] = [];
        await page.route(/\/api\/favorites/, async route => {
            const method = route.request().method();
            if (method === 'GET') {
                await route.fulfill({ status: 200, json: favorites });
            } else if (method === 'POST') {
                const body = JSON.parse(route.request().postData() || '{}');
                const newFav = { id: 'fav-1', name: body.name, description: body.description, isOwner: true };
                favorites.push(newFav);
                await route.fulfill({ status: 200, json: { success: true, id: 'fav-1' } });
            } else {
                await route.continue();
            }
        });

        await page.goto('/jar?jarId=jar-1');
        await page.waitForLoadState('networkidle');

        await page.waitForSelector('text=Pizza', { timeout: 15000 });

        const card = page.locator('.glass-card').filter({ hasText: 'Great Pizza Place' }).first();
        // Locate the heart button specifically (it's the one with the heart icon)
        const heartBtn = card.locator('button').filter({ has: page.locator('svg.lucide-heart') });
        await expect(heartBtn).toBeVisible();

        // Check initial state
        await expect(heartBtn).toHaveAttribute('title', 'Add to Favorites');

        await heartBtn.click({ force: true });

        // Wait for UI update which happens after POST and then GET
        // Use a longer timeout for the title change to be safe
        await expect(heartBtn).toHaveAttribute('title', 'Remove from Favorites', { timeout: 5000 });
    });

    test('should manage favorites from Dashboard modal', async ({ page }) => {
        const mockFavorites = [
            { id: 'fav-1', name: 'Great Pizza Place', description: 'Best pizza', isOwner: true, googleRating: 4.5, type: 'RESTAURANT' },
            { id: 'fav-2', name: 'Fun Movie Night', description: 'Popcorn!', isOwner: true, googleRating: 5.0, type: 'VENUE' }
        ];

        let favorites = [...mockFavorites];

        await page.route(/\/api\/favorites/, async route => {
            const method = route.request().method();
            if (method === 'GET') {
                await route.fulfill({ status: 200, json: favorites });
            } else if (method === 'DELETE') {
                const url = route.request().url();
                const id = url.split('/').pop();
                favorites = favorites.filter(f => f.id !== id);
                await route.fulfill({ status: 200, json: { success: true } });
            } else {
                await route.continue();
            }
        });

        await page.goto('/dashboard?jarId=jar-1');
        await page.waitForLoadState('networkidle');

        const favBtn = page.getByRole('button', { name: /favorites/i }).first();
        await expect(favBtn).toBeVisible();
        await favBtn.click({ force: true });

        const modal = page.locator('.glass-card').filter({ hasText: 'Your Favorites' }).first();
        await expect(modal).toBeVisible();

        await expect(modal.locator('text=Great Pizza Place').first()).toBeVisible();

        page.on('dialog', dialog => dialog.accept());

        await modal.locator('div').filter({ hasText: 'Great Pizza Place' }).getByRole('button', { name: /remove/i }).first().click();

        await expect(modal.locator('text=Great Pizza Place').first()).not.toBeVisible();
    });
});
