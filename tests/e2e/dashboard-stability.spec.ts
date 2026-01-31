import { test, expect } from '@playwright/test';
import { mockAuth, createRandomUser } from '../utils/e2e-helpers';

test.describe('Dashboard Stability', () => {
    test('should maintain smart input content during background polling', async ({ page }) => {
        const user = createRandomUser();
        const TEST_INPUT = 'I want to go for a walk in the park';

        // 1. Mock Auth (Logged In)
        await mockAuth(page, true, { ...user, activeJarId: 'empty-jar-123' });

        // Bypass Middleware for clean routing
        await page.setExtraHTTPHeaders({ 'x-e2e-bypass': 'true' });

        // 2. Mock API responses
        // Mock User Details (ensure we have an active jar)
        await page.route('**/api/auth/me', async (route) => {
            await route.fulfill({
                status: 200,
                json: {
                    user: {
                        ...user,
                        id: 'user-123',
                        activeJarId: 'empty-jar-123',
                        memberships: [{ jarId: 'empty-jar-123', role: 'OWNER', jar: { name: 'Empty Test Jar', topic: 'General', id: 'empty-jar-123' } }]
                    }
                }
            });
        });

        // Mock Ideas (Polled every 4s)
        let pollCount = 0;
        await page.route('**/api/ideas', async (route) => {
            pollCount++;

            await route.fulfill({
                status: 200,
                json: [] // Always empty
            });
        });

        // 3. Navigate to Dashboard

        await page.goto('/dashboard');

        // 4. Wait for Empty State & Input
        // Using data-tour selector which is more reliable than dynamic placeholders
        const smartInput = page.locator('div[data-tour="smart-prompt-input"] input[type="text"]');
        await expect(smartInput).toBeVisible({ timeout: 15000 });

        // 5. Type into Smart Input

        await smartInput.fill(TEST_INPUT);

        // 6. Wait for Polling to occur (>= 5 seconds to ensure at least one 4s poll happens)

        await page.waitForTimeout(6000);

        // 7. Verify Input is still there
        const inputValue = await smartInput.inputValue();


        expect(inputValue).toBe(TEST_INPUT);
        expect(pollCount).toBeGreaterThan(0);


    });
});
