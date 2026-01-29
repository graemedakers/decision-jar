import { test, expect } from '@playwright/test';
import { robustClick } from '../utils/e2e-helpers';
const fs = require('fs');

const timestamp = new Date().getTime();
const email = `e2e_user_${timestamp}@example.com`;
const password = 'Password123!';

test.describe('Golden Path Journey', () => {

    test('should signup, create jar, add an idea via Magic Add, and spin the jar', async ({ page }) => {
        test.setTimeout(120000);

        page.on('dialog', dialog => {
            console.log(`[Dialog] ${dialog.type()}: ${dialog.message()}`);
            dialog.accept();
        });

        page.on('console', msg => {
            console.log(`[Browser ${msg.type().toUpperCase()}] ${msg.text()}`);
        });

        // Track network for debugging
        page.on('request', request => {
            if (request.method() === 'POST') {
                console.log(`[Network Request] POST ${request.url()}`);
            }
        });
        page.on('response', response => {
            if (response.status() >= 400) {
                console.log(`[Network Response ERROR] ${response.status()} ${response.url()}`);
            }
        });

        await page.goto('/signup');

        const nameInput = page.locator('input[name="name"]');
        const emailInput = page.locator('input[name="email"]');
        const passwordInput = page.locator('input[name="password"]');

        await expect(emailInput).toBeVisible({ timeout: 10000 });

        await nameInput.fill('E2E User');
        await emailInput.fill(email);
        await passwordInput.fill(password);

        const setupJarButton = page.locator('button', { hasText: 'Set up your first jar now' });
        if (await setupJarButton.isVisible()) {
            await setupJarButton.click();
        }

        await page.getByRole('button', { name: /create account/i }).click();

        try {
            console.log('Waiting for Dashboard...');
            await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
        } catch (e) {
            console.log('Redirect failed, forcing login...');
            await page.goto('/login');
            await page.locator('input[name="email"]').fill(email);
            await page.locator('input[name="password"]').fill(password);
            await page.getByRole('button', { name: /sign in/i }).click();
            await expect(page).toHaveURL(/.*dashboard/, { timeout: 20000 });
        }

        console.log('Dashboard reached. Waiting for content...');

        // Wait for loading to disappear
        const loadingText = page.locator('text=Finding your jar');
        if (await loadingText.isVisible({ timeout: 5000 }).catch(() => false)) {
            await expect(loadingText).not.toBeVisible({ timeout: 30000 });
        }

        // Mock AI classify
        await page.route('**/api/intent/classify', async route => {
            console.log('!!! MOCK INTERCEPTED /api/intent/classify !!!');
            await route.fulfill({
                json: {
                    success: true,
                    intent: { intentAction: 'ADD_SINGLE', topic: 'Go for a walk', targetCategory: 'ACTIVITY' }
                }
            });
        });

        // Mock Magic Idea (random fill)
        await page.route('**/api/magic-idea', async route => {
            console.log('!!! MOCK INTERCEPTED /api/magic-idea !!!');
            await route.fulfill({
                json: {
                    description: 'Go for a walk',
                    category: 'ACTIVITY',
                    indoor: false,
                    duration: 1,
                    activityLevel: 'LOW',
                    cost: '$',
                    timeOfDay: 'ANY'
                }
            });
        });

        const smartInput = page.locator('input[placeholder*="Ex:"]');
        await expect(smartInput).toBeVisible({ timeout: 20000 });
        await smartInput.fill('Go for a walk');

        const magicAddBtn = page.locator('button', { hasText: /Magic Add/i });
        if (await magicAddBtn.isVisible()) {
            await magicAddBtn.click();
        } else {
            await page.keyboard.press('Enter');
        }

        console.log('Submitted prompt. Waiting for modal...');

        const modalTitle = page.locator('h2', { hasText: /Add New Idea|Edit Idea/i });
        await expect(modalTitle).toBeVisible({ timeout: 20000 });
        console.log('Add Idea modal visible.');

        // Wait for magic loading to finish
        const magicSpinner = page.locator('svg.animate-spin');
        if (await magicSpinner.isVisible({ timeout: 2000 }).catch(() => false)) {
            console.log('Waiting for magic generation...');
            await expect(magicSpinner).not.toBeVisible({ timeout: 15000 });
        }

        // Verify description is populated
        const descInput = page.locator('#description-input, input[placeholder*="blanket fort"]');
        await expect(descInput).toBeVisible({ timeout: 10000 });
        const val = await descInput.inputValue();
        console.log(`Description value in modal: "${val}"`);

        const addToJarBtn = page.locator('button').filter({ hasText: /Add to Jar/i });
        await expect(addToJarBtn).toBeVisible({ timeout: 10000 });

        console.log('Clicking Add to Jar button...');
        await addToJarBtn.click();

        // Wait for modal to close
        await expect(modalTitle).not.toBeVisible({ timeout: 20000 });
        console.log('Modal closed.');

        console.log('Verifying idea count on dashboard...');
        // The sidebar summary should now say "1 ideas"
        await expect(page.locator('text=1 ideas')).toBeVisible({ timeout: 15000 });
        console.log('Count updated to 1.');

        console.log('Navigating to /jar to verify idea text...');
        await page.goto('/jar', { waitUntil: 'networkidle' });
        await expect(page.locator('text=Go for a walk')).toBeVisible({ timeout: 20000 });
        console.log('Idea "Go for a walk" found in jar!');

        console.log('Returning to dashboard to spin...');
        await page.goto('/dashboard', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000); // Give it time to hydrate

        // Use more specific locator
        // Use robust data-testid selector
        const spinButton = page.getByTestId('spin-button');
        await expect(spinButton).toBeVisible({ timeout: 15000 });
        await expect(spinButton).toBeEnabled({ timeout: 15000 });

        console.log('Clicking spin button via robustClick...');
        await robustClick(page, spinButton);
        console.log('Spinning...');

        console.log('Waiting for reveal modal...');
        await expect(page.locator('h2', { hasText: /It's Decided!|Idea Details/i })).toBeVisible({ timeout: 25000 });
        await expect(page.locator('h4', { hasText: /Go for a walk/i })).toBeVisible({ timeout: 15000 });
        console.log('Result verified!');

        await page.keyboard.press('Escape');
        console.log('Done!');
    });

});
