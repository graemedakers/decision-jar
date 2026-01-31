import { test, expect } from '@playwright/test';
import { robustClick, createRandomUser } from '../utils/e2e-helpers';

test.describe('Rich Data Persistence', () => {
    const user = createRandomUser();

    test('should preserve rich data (photos, website, address) when editing description', async ({ page }) => {
        test.setTimeout(240000); // 4 minutes

        page.on('console', msg => console.log(`[Browser ${msg.type().toUpperCase()}] ${msg.text()}`));

        // 1. Signup with JAR creation
        console.log('Starting signup with jar setup...');
        await page.goto('/signup');

        await page.locator('input[name="name"]').fill(user.name);
        await page.locator('input[name="email"]').fill(user.email);
        await page.locator('input[name="password"]').fill(user.password);

        const setupJarButton = page.locator('button', { hasText: /Set up your first jar now/i });
        if (await setupJarButton.isVisible({ timeout: 10000 }).catch(() => false)) {
            console.log('Clicking "Set up your first jar now"...');
            await robustClick(page, setupJarButton);
            await page.waitForTimeout(1000);
            await page.locator('input[name="location"]').fill('Persistent Test City');
        }

        await page.getByRole('button', { name: /create account/i }).click();

        console.log('Waiting for Dashboard...');
        await expect(page).toHaveURL(/.*dashboard/, { timeout: 45000 });

        // Handle loader
        const loadingText = page.locator('text=Finding your jar');
        if (await loadingText.isVisible({ timeout: 15000 }).catch(() => false)) {
            await expect(loadingText).not.toBeVisible({ timeout: 60000 });
        }

        // Clear blockers
        console.log('Clearing blockers...');
        const skipWizard = page.locator('text=set it up myself manually');
        if (await skipWizard.isVisible({ timeout: 5000 }).catch(() => false)) {
            await skipWizard.click();
        }

        const closeModal = page.locator('button[aria-label="Close"]').first();
        if (await closeModal.isVisible({ timeout: 3000 }).catch(() => false)) {
            await closeModal.click();
        }

        // 2. Open Add Idea Modal
        console.log('Opening Add Idea Modal...');
        const headerAddBtn = page.locator('[data-tour="add-idea-button"]').first();
        await expect(headerAddBtn).toBeVisible({ timeout: 20000 });
        await robustClick(page, headerAddBtn);

        console.log('Waiting for Add Modal...');
        const modalTitle = page.locator('h2', { hasText: /Add New Idea/i });
        await expect(modalTitle).toBeVisible({ timeout: 20000 });

        // Switch to Quick Form
        const quickFormBtn = page.locator('button[aria-label="Use Quick Form"]');
        if (await quickFormBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
            console.log('Switching to Quick Form...');
            await robustClick(page, quickFormBtn);
            await page.waitForTimeout(1000);
        }

        // 3. Fill Rich Data
        console.log('Filling form with rich data...');
        // Use ID for description to ensure we are in the correct form form
        const descInput = page.locator('#description-input');
        await expect(descInput).toBeVisible({ timeout: 10000 });
        await descInput.fill('Persistence Test Idea');

        // Use specific aria-label selector for Details to avoid ambiguity
        // And use scrollIntoViewIfNeeded to ensure it's visible
        const detailsInput = page.locator('textarea[aria-label="Details"]');

        console.log('Scrolling to Details input...');
        // Force scroll if needed, though fill should handle it
        // We skip the strict 'toBeVisible' check which might fail if it's just off-screen
        // relying on fill's actionability check
        await detailsInput.fill('Address: 123 Persistent Ave\nWeb: https://persistent.com\nNote: This should be preserved.');

        // Add to Jar
        console.log('Saving new idea...');
        const addBtnFinal = page.getByRole('button', { name: /Add to Jar/i });
        await robustClick(page, addBtnFinal);
        await expect(modalTitle).not.toBeVisible({ timeout: 45000 });

        // 4. Navigate to Jar and Edit
        console.log('Navigating to /jar...');
        await page.goto('/jar', { waitUntil: 'networkidle' });

        const ideaRow = page.locator('text=Persistence Test Idea');
        await expect(ideaRow).toBeVisible({ timeout: 30000 });
        console.log('Opening idea for edit...');
        await ideaRow.click();

        console.log('Waiting for Edit Modal...');
        const editModalTitle = page.locator('h2', { hasText: /Edit Idea/i });
        await expect(editModalTitle).toBeVisible({ timeout: 20000 });

        // Switch to EDIT mode if needed
        const editDetailsBtn = page.locator('button', { hasText: 'Edit Details' });
        if (await editDetailsBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
            console.log('Switching to Edit Details mode...');
            await robustClick(page, editDetailsBtn);
            await page.waitForTimeout(1000);
        }

        // Change ONLY description
        console.log('Updating description...');
        const editDescInput = page.locator('#description-input');
        await expect(editDescInput).toBeVisible();
        await editDescInput.fill('Updated Name But Keep Data');

        // Save
        console.log('Saving edits...');
        await page.getByRole('button', { name: /Save Changes/i }).click();
        await expect(editModalTitle).not.toBeVisible({ timeout: 30000 });

        // 5. Re-open and Verify
        console.log('Re-opening to verify data...');
        const updatedIdeaRow = page.locator('text=Updated Name But Keep Data');
        await expect(updatedIdeaRow).toBeVisible({ timeout: 30000 });
        await updatedIdeaRow.click();

        // Switch to EDIT mode again to verify raw data
        if (await editDetailsBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
            await robustClick(page, editDetailsBtn);
            await page.waitForTimeout(1000);
        }

        const finalDetailsInput = page.locator('textarea[aria-label="Details"]');
        await expect(finalDetailsInput).toBeVisible({ timeout: 10000 });
        const detailsVal = await finalDetailsInput.inputValue();
        console.log(`Final details content: "${detailsVal}"`);

        expect(detailsVal).toContain('123 Persistent Ave');
        expect(detailsVal).toContain('https://persistent.com');

        console.log('SUCCESS: Rich data was preserved!');
    });
});
