
import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Decision Jar/);
});

test('onboarding visible on first visit', async ({ page }) => {
    // Clear cookies/storage to simulate first visit if needed, or Playwright starts fresh context by default.
    await page.goto('/');

    // Check for the Decision Jar header or button
    await expect(page.locator('text=Decision Jar')).toBeVisible();
});
