import { test, expect } from '@playwright/test';

const timestamp = new Date().getTime();
const email = `spin_test_${timestamp}@example.com`;
const password = 'Password123!';

test.describe('Spin Filter UI', () => {

    test('should allow using the Mad Libs filter to spin', async ({ page }) => {
        test.setTimeout(60000);

        // 1. Signup
        await page.goto('/signup');
        await page.locator('input[name="name"]').fill('Spin Tester');
        await page.locator('input[name="email"]').fill(email);
        await page.locator('input[name="password"]').fill(password);
        await page.getByRole('button', { name: /create account/i }).click();
        await expect(page).toHaveURL(/.*dashboard/, { timeout: 30000 });

        // 2. Add an Idea (so we can spin)
        const smartInput = page.locator('input[placeholder*="Ex:"]');
        await expect(smartInput).toBeVisible();
        await smartInput.fill('Test Spin Idea');
        await page.keyboard.press('Enter');

        const addToJarBtn = page.locator('button').filter({ hasText: /Add to Jar/i });
        await expect(addToJarBtn).toBeVisible({ timeout: 10000 });
        await addToJarBtn.click();
        await expect(page.locator('text=Test Spin Idea')).toBeVisible();

        // 3. Open Spin Filter
        // Assuming there is a Filter button or triggering Spin flow opens it?
        // In the previous code, SpinFiltersModal was used. 
        // We need to find how to open it. 
        // If clicking "Spin" opens the modal...
        const spinButton = page.getByTestId('spin-button');
        await expect(spinButton).toBeVisible();

        // Check if there is a separate filter button?
        // Usually, there's a filter icon nearby.
        // Let's check for a button with a filter icon or "Filter" text.
        // If not, we click Spin and see if the modal appears.

        // Try clicking a "Filter" button if it exists.
        const filterBtn = page.locator('button:has(.lucide-filter)'); // Heuristic
        if (await filterBtn.count() > 0) {
            await filterBtn.click();
        } else {
            // Maybe Spin button opens it?
            // But usually Spin button immediately spins if no filters.
            // Wait, looking at Dashboard code would specific.
            // I'll try clicking "Spin" and see if "Tune Your Vibe" appears.
            // If not, I'll fail and I might need to find the trigger.
            await spinButton.click();
        }

        // 4. Verify New UI (Mad Libs)
        const vibeHeader = page.locator('text=tune your vibe'); // Case insensitive check?
        // Or "I want to"
        try {
            await expect(page.locator('text=Tune Your Vibe')).toBeVisible({ timeout: 5000 });
            // Check for Mad Libs tokens
            await expect(page.locator('text=I want to')).toBeVisible();
            await expect(page.locator('text=do anything')).toBeVisible(); // Placeholder
        } catch (e) {
            console.log("Filter modal did not appear or text mismatch.");
            // If spin happened immediately, we missed the filter step.
            // Maybe we need to enable filters? 
            // Just verifying the app runs is good too.
            throw e;
        }

        // 5. Interact with a token
        await page.locator('text=do anything').click();
        await expect(page.locator('text=Select Idea Types')).toBeVisible();
        await page.locator('button:has-text("Watch")').click();

        // 6. Spin
        await page.locator('button:has-text("Find My Adventure")').click();

        // 7. Verify Result
        await expect(page.locator('h2', { hasText: /It's Decided!|Idea Details/i })).toBeVisible({ timeout: 20000 });

    });
});
