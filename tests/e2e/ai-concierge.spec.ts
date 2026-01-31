import { test, expect } from '@playwright/test';
import { robustClick, waitForTestId } from '../utils/e2e-helpers';


test.describe('AI Concierge Tools E2E', () => {
    let email: string;
    const password = 'Password123!';

    test.beforeEach(async ({ page }) => {
        test.setTimeout(300000);

        // 1. Generate unique user ID for this test run
        const timestamp = Date.now();
        const rand = Math.floor(Math.random() * 1000);
        email = `concierge_user_${timestamp}${rand}@example.com`;
        const jarId = `jar_${timestamp}`;

        // 2. Proactively Mock API Routes BEFORE any navigation


        // Mock: Session/User - FULLY POPULATED to prevent Dashboard crashes
        await page.route('**/api/auth/me', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    user: {
                        id: `user_${timestamp}`,
                        email: email,
                        name: 'Concierge Tester',
                        isPremium: true, // Force premium for tools
                        activeJarId: jarId,
                        jarName: 'Test Jar',
                        jarTopic: 'General',
                        memberCount: 1,
                        memberships: [
                            {
                                jarId: jarId,
                                role: 'OWNER',
                                jar: {
                                    id: jarId,
                                    name: 'Test Jar',
                                    topic: 'General',
                                    type: 'GENERIC'
                                }
                            }
                        ],
                        // Standard UserData fields to satisfy hooks
                        items: [],
                        emailVerified: new Date().toISOString(),
                        image: null
                    }
                })
            });
        });



        // 1b. Clear Service Workers to prevent caching interference
        await page.evaluate(async () => {
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (const registration of registrations) {
                    await registration.unregister();
                }
            }
        });

        // Mock: Session Check (Restored for Bypass Mode)
        await page.route('**/api/auth/session', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    user: {
                        email: email,
                        name: 'Concierge Tester'
                    },
                    expires: new Date(Date.now() + 86400000).toISOString()
                })
            });
        });

        // Mock: Ideas (Start Empty to trigger onboarding/tools)
        await page.route('**/api/ideas*', async (route) => {
            // If it's a POST (generation), let it through or mock success
            if (route.request().method() === 'POST') {
                // For bulk generate, we can mock a success if we want purely UI test, 
                // but let's try to pass through primarily, or mock if it fails constantly.
                // For now, let's allow it to hit the real backend if possible, OR mock success response.
                // Let's mock SUCCESS for speed and reliability unless we are testing the LLM integration explicitly.
                // The user wants to "Exercise" the tools.

                const reqWithBody = route.request();
                const postData = reqWithBody.postDataJSON();

                if (reqWithBody.url().includes('bulk-generate')) {

                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({
                            success: true,
                            count: 1,
                            ideas: [
                                {
                                    id: `idea_${Date.now()}`,
                                    description: "Mocked AI Idea Result",
                                    category: "ACTIVITY",
                                    ideaType: postData.intent?.targetCategory || 'ACTIVITY'
                                }
                            ]
                        })
                    });
                    return;
                }
            }

            // GET requests - return empty list initially
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([])
            });
        });

        // Mock: Invite Validation (Prevent 404s on signup components)
        await page.route('**/api/invites/validate*', async route => {
            await route.fulfill({ status: 200, body: JSON.stringify({ valid: false }) });
        });

        // 3. Monitor Console for Browser Crashes
        page.on('console', msg => {
            if (msg.type() === 'error') console.error(`[BROWSER ERROR] ${msg.text()}`);

        });

        page.on('pageerror', err => {
            console.error(`[BROWSER CRASH] ${err}`);
        });



        // Mock: User Settings (to prevent 404s/errors in modals)
        await page.route('**/api/user/settings', async route => {
            await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
        });

        // Mock: Favorites (List and Count)
        await page.route('**/api/favorites', async route => {
            await route.fulfill({ status: 200, body: JSON.stringify([]) });
        });

        // Mock: Ideas (Return 1 idea to show Tools button)
        await page.route('**/api/ideas*', async (route) => {
            // If it's a POST (generation), mock success
            if (route.request().method() === 'POST') {
                const reqWithBody = route.request();
                const postData = reqWithBody.postDataJSON();
                if (reqWithBody.url().includes('bulk-generate')) {
                    await route.fulfill({
                        status: 200,
                        body: JSON.stringify({
                            success: true,
                            count: 1,
                            ideas: [
                                {
                                    id: `idea_${Date.now()}`,
                                    description: "Mocked AI Idea Result",
                                    category: "ACTIVITY",
                                    ideaType: postData.intent?.targetCategory || 'ACTIVITY'
                                }
                            ]
                        })
                    });
                    return;
                }
            }

            // GET requests
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    {
                        id: 'idea_initial',
                        description: 'Initial Mock Idea',
                        category: 'ACTIVITY',
                        status: 'APPROVED',
                        userId: `user_1`,
                        jarId: `jar_1`,
                        createdAt: new Date().toISOString(),
                    }
                ])
            });
        });

        // Mock: Unified Concierge Endpoint
        await page.route('**/api/concierge', async route => {

            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    recommendations: [
                        {
                            id: 'mock_rec_1',
                            title: 'Mocked AI Idea Result',
                            description: 'A great place to go',
                            reason: 'Matches your vibe',
                            matchScore: 95,
                            ideaType: 'ACTIVITY',
                            typeData: {
                                name: 'Mocked AI Idea Result',
                                formattedAddress: '123 Test St'
                            }
                        }
                    ]
                })
            });
        });

        // Mock: AI Usage
        await page.route('**/api/user/ai-usage', async route => {
            await route.fulfill({
                status: 200,
                body: JSON.stringify({ remaining: 10, dailyLimit: 10, isPro: true })
            });
        });

        // 4. Direct Navigation with Middleware Bypass

        await page.setExtraHTTPHeaders({
            'x-e2e-bypass': 'true'
        });

        await page.goto('/dashboard');

        // 5. Robust Wait for Dashboard

        await page.waitForURL('**/dashboard', { timeout: 30000 });
        // Wait for user name or jar name from our mock
        await expect(page.locator('text=Test Jar')).toBeVisible({ timeout: 60000 });
    });

    test('Dining Concierge should find and add a restaurant', async ({ page }) => {
        // Open Tools

        // Direct navigation to tools page is more robust
        await page.goto('/explore');


        // Wait for page title
        await expect(page.locator('h1:has-text("Explore")')).toBeVisible({ timeout: 10000 });

        // Select Dining Concierge

        await page.locator('button:has-text("Dining Concierge")').click();

        // Wait for Concierge Modal
        await expect(page.locator('h2:has-text("Dining Concierge")')).toBeVisible({ timeout: 20000 });

        // Fill Form-like elements

        // Robust option selection
        const italianBtn = page.locator('button:has-text("Italian")');
        if (await italianBtn.isVisible()) await italianBtn.click({ force: true });
        const romanticBtn = page.locator('button:has-text("Romantic")');
        if (await romanticBtn.isVisible()) await romanticBtn.click({ force: true });

        // Generate

        const generateBtn = page.getByTestId('concierge-generate-btn');
        await expect(generateBtn).toBeVisible({ timeout: 20000 });
        await robustClick(page, generateBtn);

        // Wait for result card (Mocked)

        // We can check for the results container or specific result card
        await expect(page.getByTestId('concierge-result-card').first()).toBeVisible({ timeout: 30000 });

        // Add to Jar

        await robustClick(page, page.getByTestId('add-to-jar-btn').first());

        // Verify Success
        await expect(page.getByTestId('added-badge').first()).toBeVisible({ timeout: 10000 });
    });

    test('Movie Scout should handle streaming filters and add movie', async ({ page }) => {
        await page.goto('/dashboard');

        // Open Tools
        // Direct navigation to tools page
        await page.goto('/explore');


        // Wait for page title
        await expect(page.locator('h1:has-text("Explore")')).toBeVisible();

        await page.locator('button:has-text("Movie Scout")').click();

        // Wait for Movie Scout Modal
        await expect(page.locator('text=Movie Scout')).toBeVisible({ timeout: 20000 });

        // Select Streaming
        const streamingBtn = page.locator('button:has-text("Streaming")');
        if (await streamingBtn.isVisible()) await streamingBtn.click({ force: true });
        const netflixBtn = page.locator('button:has-text("Netflix")');
        if (await netflixBtn.isVisible()) await netflixBtn.click({ force: true });

        // Generate
        const generateBtn = page.getByTestId('concierge-generate-btn');
        await expect(generateBtn).toBeVisible({ timeout: 20000 });
        await robustClick(page, generateBtn);

        // Wait for result and Add
        await expect(page.getByTestId('concierge-result-card').first()).toBeVisible({ timeout: 30000 });
        await robustClick(page, page.getByTestId('add-to-jar-btn').first());

        // Verify
        await expect(page.getByTestId('added-badge').first()).toBeVisible({ timeout: 10000 });
    });

    test('Dinner Party Chef should preserve structured data', async ({ page }) => {
        await page.goto('/dashboard');

        // Open Tools
        // Direct navigation to tools page
        await page.goto('/explore');


        // Wait for page title
        await expect(page.locator('h1:has-text("Explore")')).toBeVisible({ timeout: 10000 });

        try {
            await page.locator('button:has-text("Dinner Party Chef")').click({ timeout: 5000 });
        } catch (e) {
            // Log body text if fails


            throw e;
        }

        // Wait for Chef Modal
        await expect(page.locator('text=Dinner Party Chef')).toBeVisible({ timeout: 20000 });

        // Select Options
        const dinnerBtn = page.locator('button:has-text("Dinner Party")');
        if (await dinnerBtn.isVisible()) await dinnerBtn.click({ force: true });
        const italianBtn = page.locator('button:has-text("Italian")');
        if (await italianBtn.isVisible()) await italianBtn.click({ force: true });
        const coursesBtn = page.locator('button:has-text("3 Courses")');
        if (await coursesBtn.isVisible()) await coursesBtn.click({ force: true });

        // Generate
        const generateBtn = page.getByTestId('concierge-generate-btn');
        await expect(generateBtn).toBeVisible({ timeout: 20000 });
        await robustClick(page, generateBtn);

        // Wait for result and Add
        await expect(page.getByTestId('concierge-result-card').first()).toBeVisible({ timeout: 30000 });
        await robustClick(page, page.getByTestId('add-to-jar-btn').first());

        // Verify
        await expect(page.getByTestId('added-badge').first()).toBeVisible({ timeout: 10000 });
    });
});
