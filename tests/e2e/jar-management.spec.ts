import { test, expect } from '../utils/playwright-extensions';
import { prisma as db } from '../../lib/prisma';

test.describe('Jar Management', () => {
    test.beforeEach(async ({ page, seededData }) => {
        // Bypass auth
        await page.setExtraHTTPHeaders({
            'x-e2e-bypass': 'true',
            'x-e2e-user-email': seededData.user.email
        });

        // Ensure user is owner of the seeded jar
        const { jar, user } = seededData;

        // Initialize localStorage
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

        // Mock external integrations/legacy APIs only
        await page.route('**/api/ideas*', async route => {
            // Passthrough or mock if needed (AddIdeaModal uses new POST action but edit/fetch might use API? Check code)
            // AddMemoryModal uses Server Action now. But fetching ideas list still uses /api/ideas (?)
            // Actually Dashboard fetches ideas via /api/ideas? No, Dashboard client?
            // Dashboard now uses Server Component to fetch ideas? No, client component.
            // Wait, we didn't migrate /api/ideas. So it is still used for fetching logs.
            await route.continue();
        });

        await page.route('**/api/favorites*', async route => {
            await route.fulfill({ json: [] });
        });

        await page.route('**/api/reviews', async route => {
            await route.fulfill({ json: [] });
        });

        await page.goto(`/dashboard?jarId=${jar.id}`);
        await page.waitForLoadState('networkidle');

        // Wait for dashboard content
        await page.waitForSelector('button[aria-label="Settings"]', { timeout: 30000 });
    });

    test('should allow admin to rename jar via Manager Modal', async ({ page, seededData }) => {
        // 1. Open Jar Switcher
        await page.locator('button[data-tour="jar-selector"]').click({ force: true });
        // 2. Click "Manage My Jars"
        await page.locator('button:has-text("Manage My Jars")').click({ force: true });

        // 3. Verify Modal Open
        await expect(page.locator('text=Manage Your Jars')).toBeVisible();

        // 4. Click Rename (Pencil Icon)
        await page.locator('button:has-text("Rename")').first().click({ force: true });

        // 5. Enter new name
        const input = page.locator('input[type="text"]').last();
        await input.fill('Renamed Jar');
        await input.press('Enter');

        // 6. Verify UI Update
        await expect(page.locator('text=Jar renamed successfully')).toBeVisible();
        await expect(page.locator('text=Renamed Jar')).toBeVisible();

        // 7. Click Manage Jars again to check list name (optional, UI check is good)
    });

    test('should allow admin to manage members', async ({ page, seededData }) => {
        const { jar } = seededData;
        // Seed another member
        const memberUser = await db.user.create({
            data: {
                email: `member_${Date.now()}@test.com`,
                name: 'Member User',
                memberships: {
                    create: {
                        jarId: jar.id,
                        role: 'MEMBER'
                    }
                }
            }
        });

        // Reload to pick up new member in dashboard/modal
        await page.reload();

        await page.locator('button[data-tour="jar-selector"]').click({ force: true });
        await page.locator('button:has-text("Manage My Jars")').click({ force: true });

        // 2. Click "Members"
        await page.locator('button:has-text("Members")').first().click({ force: true });

        // 3. Verify Members Modal
        await expect(page.locator('text=Jar Members')).toBeVisible();
        await expect(page.locator('text=Member User')).toBeVisible();

        // 4. Open Action Menu for Member User
        // Need to target specific row more reliably
        const memberRow = page.locator('li', { hasText: 'Member User' }).first();
        await memberRow.locator('button').last().click({ force: true }); // Meatballs menu

        // 5. Promote to Admin
        await page.locator('button:has-text("Promote to Admin")').click({ force: true });

        // 6. Verify Toast
        await expect(page.locator('text=is now an admin')).toBeVisible();
    });

    test('should allow admin to empty jar via Settings', async ({ page, seededData }) => {
        // 1. Click Settings Icon in Header
        await page.locator('button[aria-label="Settings"]').first().click({ force: true });

        // 2. Switch to "Jar Settings" Tab
        await page.locator('button:has-text("Jar Settings")').click({ force: true });

        // 3. Scroll to Danger Zone and Click Empty Jar
        await page.locator('button:has-text("Empty Jar")').first().click({ force: true });

        // 5. Confirm Dialog
        await expect(page.locator('text=Are you sure you want to empty this jar?')).toBeVisible();
        await page.locator('button:has-text("Empty Jar")').last().click({ force: true }); // Confirm button

        // 6. Verify Success
        await expect(page.locator('text=Jar emptied successfully!')).toBeVisible();
    });
});
