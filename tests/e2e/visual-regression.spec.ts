import { test, expect } from '../utils/playwright-extensions';

test.describe('Visual Regression - Premium UI', () => {
    test.beforeEach(async ({ page, seededData }) => {
        // Debug: Log all console output
        page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));
        page.on('pageerror', err => console.log(`BROWSER ERROR: ${err}`));
        page.on('requestfailed', req => console.log(`REQUEST FAILED: ${req.url()} ${req.failure()?.errorText}`));

        // Standard setup: Bypass middleware and specify exact user for Server Actions
        await page.setExtraHTTPHeaders({
            'x-e2e-bypass': 'true',
            'x-e2e-user-email': seededData.user.email
        });

        // Mock ideas endpoint to return seeded data
        // The client-side useIdeas hook calls /api/ideas
        await page.route('**/api/ideas', async (route) => {
            console.log('MOCK HIT: /api/ideas');
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(seededData.ideas)
            });
        });
    });

    test('Dashboard Jar Visualization', async ({ page, seededData }) => {
        await page.goto('/dashboard');

        // Wait for 3D Jar to load
        const jarVisual = page.getByTestId('jar-visual');
        await expect(jarVisual).toBeVisible({ timeout: 15000 });

        // Wait for animations to settle
        await page.waitForTimeout(3000);

        // Take a screenshot of the main jar area
        // Masking dynamic text (Jar name, XP badge) to focus on UI styles
        // The XP badge is specifically identified by Layers icon and text inside jarVisual
        await expect(page).toHaveScreenshot('dashboard-jar.png', {
            mask: [
                page.locator('h1'), // Jar name
                page.locator('.streak-badge'), // If visible
                jarVisual.locator('.bg-white\\/95'), // Mask the counter badge
            ],
            threshold: 0.2,
            maxDiffPixelRatio: 0.05,
            animations: 'disabled'
        });
    });

    test('Date Reveal Modal', async ({ page, seededData }) => {
        await page.goto('/dashboard');

        // Trigger a spin
        const spinBtn = page.getByTestId('spin-button');
        await expect(spinBtn).toBeVisible({ timeout: 10000 });
        await spinBtn.click();

        // Wait for reveal modal by test-id
        const modal = page.getByTestId('date-reveal-modal');
        try {
            await expect(modal).toBeVisible({ timeout: 10000 });
        } catch (e) {
            // Check for error toasts if modal fails
            const toast = page.locator('ol[data-sonner-toaster] li[data-type="error"]');
            if (await toast.isVisible()) {
                console.log('TEST FAILURE DEBUG - ERROR TOAST FOUND:', await toast.textContent());
            } else {
                console.log('TEST FAILURE DEBUG - No error toast found, strictly modal visibility timeout.');
            }
            // Capture screenshot of failure state
            await page.screenshot({ path: 'C:/Users/graem/.gemini/antigravity/brain/684510af-87f9-4560-95d6-e0bd93713880/debug_failure.png', fullPage: true });
            throw e;
        }

        // Wait for animations/glassmorphism to settle
        await page.waitForTimeout(3000);

        // Capture reveal modal
        await expect(modal).toHaveScreenshot('date-reveal-modal.png', {
            mask: [
                modal.locator('h2'), // "It's Decided!" or title
                modal.locator('.unified-idea-card'), // Mask the entire card contents as it's dynamic
                modal.locator('.idea-type-actions'), // Mask actions
            ],
            threshold: 0.2,
            maxDiffPixelRatio: 0.08, // Slightly higher for modal overlays
            animations: 'disabled'
        });
    });
});
