import { test, expect } from '../utils/playwright-extensions';
import { AIMockReporter } from '../utils/ai-mocks';

test.describe('AI Concierge Tools', () => {
    test.beforeEach(async ({ page, seededData }) => {
        // Bypass auth
        await page.setExtraHTTPHeaders({
            'x-e2e-bypass': 'true',
            'x-e2e-user-email': seededData.user.email
        });

        // Mock generic ideas fetch
        await page.route('**/api/ideas', async (route) => {
            await route.fulfill({ status: 200, json: seededData.ideas });
        });

    });

    test('Dining Concierge Flow', async ({ page }) => {
        const aiMocks = new AIMockReporter(page);
        await page.goto('/dashboard');

        // Open Unified Concierge
        await expect(page.getByTestId('jar-visual')).toBeVisible({ timeout: 15000 });
        await page.getByTestId('unified-concierge-btn').click();

        // Verify Modal Opens
        await expect(page.getByTestId('concierge-modal')).toBeVisible({ timeout: 15000 });

        // Select Skill from Picker
        await page.getByTestId('skill-dining_concierge').click();
        await expect(page.getByText('Dining Concierge')).toBeVisible();

        // Interact with inputs (optional but good for realism)
        // Select 'Italian' if it exists or type custom
        // We'll just hit generate for now to test the mock and add flow

        // Mock Concierge API Response
        await aiMocks.mockSuccess('**/api/concierge', {
            recommendations: [
                {
                    name: 'Luigi\'s Trattoria',
                    description: 'Authentic Italian pasta and pizza.',
                    cuisine: 'Italian',
                    price: 'moderate',
                    address: '123 Pasta Lane',
                    typeData: {
                        establishmentName: 'Luigi\'s Trattoria',
                        cuisine: 'Italian'
                    }
                }
            ]
        });

        // Click Generate
        const generateBtn = page.getByTestId('concierge-generate-btn');
        await generateBtn.click();

        // Verify Results
        const resultsContainer = page.getByTestId('concierge-results-container');
        await expect(resultsContainer).toBeVisible();
        await expect(page.getByText('Luigi\'s Trattoria')).toBeVisible();

        // Add to Jar
        const addBtn = page.getByTestId('add-to-jar-btn').first();
        await addBtn.click();

        // Verify Added State
        await expect(page.getByTestId('added-badge')).toBeVisible();

        // Verify Data in DB (implicit via the success result, but we could check the JAR via API if we wanted)
    });

    test('Movie Concierge Flow', async ({ page }) => {
        const aiMocks = new AIMockReporter(page);
        await page.goto('/dashboard');

        // Open Unified Concierge
        await expect(page.getByTestId('jar-visual')).toBeVisible({ timeout: 15000 });
        await page.getByTestId('unified-concierge-btn').click();

        // Verify Modal Opens
        await expect(page.getByTestId('concierge-modal')).toBeVisible({ timeout: 15000 });

        // Select Skill from Picker
        await page.getByTestId('skill-movie_concierge').click();
        await expect(page.getByText('Movie Picker')).toBeVisible();

        // Mock Concierge API Response
        await aiMocks.mockSuccess('**/api/concierge', {
            recommendations: [
                {
                    name: 'Inception',
                    typeData: {
                        title: 'Inception',
                        watchMode: 'STREAMING',
                        year: '2010'
                    }
                }
            ]
        });

        // Click Generate
        await page.getByTestId('concierge-generate-btn').click();

        // Verify Results
        await expect(page.getByText('Inception')).toBeVisible();

        // Add to Jar
        await page.getByTestId('add-to-jar-btn').click();
        await expect(page.getByTestId('added-badge')).toBeVisible();
    });
});
