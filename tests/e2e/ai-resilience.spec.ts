import { test, expect } from '../utils/playwright-extensions';
import { AIMockReporter } from '../utils/ai-mocks';

const AI_ENDPOINTS = {
    CONCIERGE: '/api/concierge/generate',
};

test.describe('AI Resilience - Error Handling', () => {
    test.beforeEach(async ({ page }) => {
        await page.setExtraHTTPHeaders({ 'x-e2e-bypass': 'true' });
    });

    test('should show error toast on AI rate limit (429)', async ({ page, seededData }) => {
        const aiMocks = new AIMockReporter(page);
        await aiMocks.mockRateLimit(AI_ENDPOINTS.CONCIERGE);

        await page.goto('/explore');

        // Click Dining Concierge
        await page.click('button:has-text("Dining Concierge")');

        // Wait for modal by test-id
        const modal = page.getByTestId('concierge-modal');
        await modal.waitFor({ state: 'visible', timeout: 20000 });

        // Click Italian
        await modal.locator('text=Italian').click({ force: true });

        // Click Start Planning
        await modal.locator('button:has-text("Start Planning")').click();

        // Verify error toast
        await expect(page.locator('text=/too many requests|rate limit|try again later/i')).toBeVisible({ timeout: 15000 });
    });

    test('should handle malformed JSON from AI gracefully', async ({ page, seededData }) => {
        const aiMocks = new AIMockReporter(page);
        await aiMocks.mockMalformedJson(AI_ENDPOINTS.CONCIERGE);

        await page.goto('/explore');
        await page.click('button:has-text("Dining Concierge")');

        const modal = page.getByTestId('concierge-modal');
        await modal.waitFor({ state: 'visible', timeout: 20000 });

        await modal.locator('text=Italian').click({ force: true });
        await modal.locator('button:has-text("Start Planning")').click();

        await expect(page.locator('text=/error|failed|occurred/i')).toBeVisible({ timeout: 15000 });
    });

    test('should show empty state when AI returns no results', async ({ page, seededData }) => {
        const aiMocks = new AIMockReporter(page);
        await aiMocks.mockEmptyResults(AI_ENDPOINTS.CONCIERGE);

        await page.goto('/explore');
        await page.click('button:has-text("Dining Concierge")');

        const modal = page.getByTestId('concierge-modal');
        await modal.waitFor({ state: 'visible', timeout: 20000 });

        await modal.locator('text=Italian').click({ force: true });
        await modal.locator('button:has-text("Start Planning")').click();

        await expect(modal.locator('text=/no results|no recommendations|matched/i')).toBeVisible({ timeout: 15000 });
    });
});
