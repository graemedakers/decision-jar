import { test, expect } from '@playwright/test';

test.describe('Authentication Edge Cases', () => {

    test('should show error on login failure', async ({ page }) => {
        // Handle native alert
        let dialogMessage = '';
        page.on('dialog', async dialog => {
            dialogMessage = dialog.message();
            await dialog.accept();
        });

        await page.goto('/login');

        // Fill with wrong credentials
        await page.locator('input[name="email"]').fill('wrong@example.com');
        await page.locator('input[name="password"]').fill('wrongpassword');
        await page.getByRole('button', { name: /sign in/i }).click();

        // Verify the dialog message was caught
        await expect.poll(() => dialogMessage).toContain('Invalid email or password');
    });

    test('should show error on signup email conflict', async ({ page }) => {
        // Mock the signup API to return conflict
        await page.route('**/api/auth/signup', async route => {
            await route.fulfill({
                status: 400,
                json: { error: 'User already exists' }
            });
        });

        await page.goto('/signup');
        await page.locator('input[name="name"]').fill('Existing User');
        await page.locator('input[name="email"]').fill('existing@example.com');
        await page.locator('input[name="password"]').fill('Password123!');
        await page.getByRole('button', { name: /create account/i }).click();

        // The UI should switch to the "Account Already Exists" slide
        await expect(page.locator('text=Account Already Exists')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('text=already have an account with this email')).toBeVisible();
    });

    test('should redirect unauthenticated users from dashboard', async ({ page }) => {
        // Ensure no mock session
        await page.route('**/api/auth/session', async route => {
            await route.fulfill({ json: {} });
        });

        await page.goto('/dashboard');

        // Should redirect to home or login
        await expect(page).toHaveURL(/\/login|\/$/);
    });

    test('should handle session expiration and redirect to nuke-session', async ({ page }) => {
        await page.setExtraHTTPHeaders({ 'x-e2e-bypass': 'true' });

        // Force a 401 on /api/auth/me
        await page.route('**/api/auth/me', async route => {
            await route.fulfill({
                status: 401,
                json: { error: 'Unauthorized' }
            });
        });

        // Mock session to exist for middleware bypass
        await page.route('**/api/auth/session', async route => {
            await route.fulfill({
                json: {
                    user: { id: 'user-1' },
                    expires: new Date(Date.now() + 3600000).toISOString()
                }
            });
        });

        await page.goto('/dashboard');

        // nuke-session route redirects to /?nuked=true
        await expect(page).toHaveURL(/.*nuked=true.*/, { timeout: 15000 });
    });
});
