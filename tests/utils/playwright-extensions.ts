import { test as base } from '@playwright/test';
import { seedFullJar } from './db-seeder';
import { User, Jar, Idea } from '@prisma/client';

type MyFixtures = {
    seededData: {
        user: User;
        jar: Jar;
        ideas: Idea[];
    };
};

/**
 * Extend Playwright's test to include an automatic "seededData" fixture.
 * This will seed the database before the test runs and provide the data to the test.
 * It also automatically mocks the auth endpoints to match the seeded data.
 */
export const test = base.extend<MyFixtures>({
    seededData: async ({ page }, use) => {
        // Seed the database
        const data = await seedFullJar(5);

        const { user, jar } = data;

        // Mock NextAuth /api/auth/session - used by useSession()
        await page.route('**/api/auth/session', async (route) => {
            console.log('MOCK HIT: /api/auth/session');
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    user: {
                        name: user.name,
                        email: user.email,
                        image: null,
                    },
                    expires: new Date(Date.now() + 86400000).toISOString()
                })
            });
        });

        // Mock Auth /api/auth/me - used by our custom useUser hooks
        await page.route('**/api/auth/me', async (route) => {
            console.log('MOCK HIT: /api/auth/me');
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    user: {
                        ...user,
                        isPremium: true, // Force premium for tests
                        activeJarId: jar.id,
                        jarName: jar.name,
                        memberships: [{ jarId: jar.id, role: 'OWNER', jar }]
                    }
                })
            });
        });

        // Mock AI Usage
        await page.route('**/api/user/ai-usage', async route => {
            console.log('MOCK HIT: /api/user/ai-usage');
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ count: 0, limit: 10, isUnlimited: true })
            });
        });

        // Mock Favorites
        await page.route('**/api/favorites*', async route => {
            console.log('MOCK HIT: /api/favorites');
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([])
            });
        });

        // Mock common required endpoints to avoid noise
        await page.route('**/api/user/settings', async route => {
            console.log('MOCK HIT: /api/user/settings');
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true, settings: { locale: 'en-US' } })
            });
        });

        // Provide the data to the test
        await use(data);

        // Optional: Cleanup could go here, but we often keep it for debugging failures
    },
});

export const robustClick = async (page: any, locator: any) => {
    await locator.waitFor({ state: 'visible', timeout: 10000 });
    // Try standard click first
    try {
        await locator.click({ timeout: 5000 });
    } catch (e) {
        // Fallback to force click if intercepted
        await locator.click({ force: true });
    }
};

export { expect } from '@playwright/test';
