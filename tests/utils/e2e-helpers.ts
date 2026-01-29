import { Page, Locator, expect } from '@playwright/test';

/**
 * Performs a robust click by dispatching a click event directly to the DOM node.
 * This bypasses Playwright's strict actionability checks which can be flaky with
 * complex animations or overlays.
 */
export async function robustClick(page: Page, selectorOrLocator: string | Locator) {
    const locator = typeof selectorOrLocator === 'string'
        ? page.locator(selectorOrLocator)
        : selectorOrLocator;

    await expect(locator).toBeVisible();
    await locator.evaluate(node => node.dispatchEvent(new MouseEvent('click', { bubbles: true })));
}

export async function waitForTestId(page: Page, testId: string, timeout = 10000) {
    const locator = page.getByTestId(testId);
    await expect(locator).toBeVisible({ timeout });
    return locator;
}

/**
 * Generates a random user object for testing.
 */
export function createRandomUser() {
    const timestamp = new Date().getTime();
    return {
        name: `Test User ${timestamp}`,
        email: `e2e_user_${timestamp}@example.com`,
        password: 'Password123!'
    };
}

/**
 * Mocks the authentication state for the current page context.
 * Useful for ensuring a specific auth state before navigating.
 */
export async function mockAuth(page: Page, loggedIn: boolean, userData: any = {}) {
    await page.route('**/api/auth/me', async route => {
        if (!loggedIn) {
            await route.fulfill({ status: 200, json: { user: null } });
        } else {
            await route.fulfill({
                status: 200,
                json: {
                    user: {
                        id: 'mock_user_id',
                        name: 'Mock User',
                        email: 'mock@example.com',
                        ...userData
                    }
                }
            });
        }
    });
}

