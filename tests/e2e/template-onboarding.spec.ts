import { test, expect } from '../utils/playwright-extensions';
import { AIMockReporter } from '../utils/ai-mocks';

test.describe('Template Onboarding Flow', () => {

    test.beforeEach(async ({ page, seededData }) => {
        // Bypass auth
        await page.setExtraHTTPHeaders({
            'x-e2e-bypass': 'true',
            'x-e2e-user-email': seededData.user.email
        });

        // Mock `/api/ideas` to return EMPTY array to satisfy ShowEmptyState condition
        // This force-enables the "Your Jar is Empty!" screen aka EnhancedEmptyState
        await page.route('**/api/ideas', async (route) => {
            await route.fulfill({ status: 200, json: [] });
        });

        // Ensure user endpoint returns valid data
        await page.route('**/api/auth/me', async (route) => {
            await route.fulfill({
                status: 200, json: {
                    ...seededData.user,
                    activeJarId: seededData.jar.id
                }
            });
        });
    });

    test('User can populate empty jar from template', async ({ page, seededData }) => {
        await page.goto('/dashboard');

        // 1. Verify Enhanced Empty State is visible
        await expect(page.getByText('Your Jar is Empty!')).toBeVisible({ timeout: 10000 });

        // 2. Click "Browse Templates"
        const browseBtn = page.getByRole('button', { name: /Browse Templates/i });
        await expect(browseBtn).toBeVisible();
        await browseBtn.click();

        // 3. Verify Template Browser Modal Opens
        await expect(page.getByText('Browse Jar Templates')).toBeVisible();

        // 4. Select a template (e.g. "Date Night" or first one)
        // We'll find a card and click "Use Template"
        // Wait for cards to allow rendering
        await expect(page.getByText('ideas included').first()).toBeVisible();

        const useBtn = page.getByRole('button', { name: 'Use Template' }).first();
        await expect(useBtn).toBeVisible();

        // 5. Mock the API call for adding ideas
        await page.route('**/api/jars/add-template-ideas', async (route) => {
            await route.fulfill({
                status: 200,
                json: { count: 10, message: "Success" }
            });
        });

        // 6. Click Use Template
        // Put a promise first to catch the request
        const requestPromise = page.waitForRequest(request =>
            request.url().includes('/api/jars/add-template-ideas') && request.method() === 'POST'
        );

        await useBtn.click();

        await requestPromise;

        // 7. Verify Success
        // Component does `showSuccess('Successfully added X ideas...')`
        await expect(page.getByText(/Successfully added/i)).toBeVisible();

        // Modal should close (check title not visible)
        await expect(page.getByText('Browse Jar Templates')).not.toBeVisible();
    });
});
