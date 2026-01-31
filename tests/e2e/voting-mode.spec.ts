import { test, expect } from '@playwright/test';
import { robustClick, createRandomUser, mockAuth } from '../utils/e2e-helpers';

test.describe('Voting Mode Lifecycle', () => {

    test('should allow admin to start vote, cast vote, and resolve', async ({ page }) => {
        // Debugging logs from browser


        const user = createRandomUser();
        const JAR_ID = 'jar_123';

        // 1. Setup Mocks
        // Critical: Provide "jarSelectionMode: 'VOTE'" in the user profile so the dashboard renders VotingManager
        await mockAuth(page, true, {
            ...user,
            id: 'user_123',
            activeJarId: JAR_ID,
            jarName: 'Test Jar',
            jarSelectionMode: 'VOTE',
            isCreator: true, // Admin
            memberships: [{
                jarId: JAR_ID,
                role: 'ADMIN',
                jar: {
                    id: JAR_ID,
                    name: 'Test Jar',
                    topic: 'Food',
                    type: 'SOCIAL'
                }
            }]
        });

        // Mock Initial Ideas (Candidates)
        // Using wildcard to be safe against query params order/variations
        await page.route(`**/api/ideas*`, async route => {
            await route.fulfill({
                json: [
                    { id: 'idea_1', description: 'Tacos', category: 'Food', createdById: 'other_user' },
                    { id: 'idea_2', description: 'Pizza', category: 'Food', createdById: 'other_user' },
                    { id: 'idea_3', description: 'Sushi', category: 'Food', createdById: 'user_123' } // Own idea
                ]
            });
        });

        // Mock Vote Status (Polling Endpoint)
        // We will update this mutable object to simulate server state changes
        let voteState: any = {
            active: false,
            adminName: 'Admin User',
            session: null as any,
            votesCast: 0,
            totalMembers: 3,
            hasVoted: false,
            isEligible: true
        };

        await page.route(`**/api/jars/${JAR_ID}/vote`, async route => {
            await route.fulfill({ json: voteState });
        });

        // Mock Action: Start Vote
        await page.route('**/api/actions/vote/start', async route => { // Wait, actions are mocked differently?
            // Next.js Server Actions are POST requests to the page URL with Next-Action header
            // But checking previous tests, we mocked API routes. 
            // The VotingManager calls `startVote` (Server Action). 
            // Playwright can intercept the network call underlying the Server Action.
            // However, simulating the *effect* via the polling mock is easier.
            // Real interaction: Button Click -> Server Action -> DB Update.
            // UI Update: Polling fetches new state.

            // We just need to ensure the verify step sees the change. 
            // We can update `voteState` when we interpret the UI "Start" click is done.
        });


        // 2. Navigate to Dashboard with Voting Mode
        // We force the mode via query param or ensure default state shows it?
        // Actually, the VotingManager is usually on the Dashboard if it's in voting mode.
        // But the Dashboard usually shows the "Spin" button unless we toggle mode.
        // We can go to `scan-link` or just standard dashboard and open the tool? 
        // No, VotingManager is a component. Let's see where it renders. 
        // It renders in `components/JarView.tsx` or similar? 
        // Looking at `VotingManager.tsx`, it's exported.

        // Let's assume we are on dashboard. 
        // We need to bypass Middleware
        await page.setExtraHTTPHeaders({ 'x-e2e-bypass': 'true' });

        // Mock Jar details to show we are Admin
        // The dashboard needs to know we are in a jar.
        // We mock critical data fetches if needed, or rely on 'jar_123' not existing in valid DB causing issues?
        // Actually, without a real jar in DB, `dashboard/page.tsx` might error out or redirect.
        // `golden-path` uses real DB. `join-jar` messed up because of it.
        // Since we are mocking everything, we need to mock the /api/jar/ check too if it exists.

        // Let's try navigating to a specific jar URL if possible, or just root dashboard with query param?
        await page.goto(`/dashboard?jarId=${JAR_ID}`);

        // 3. Verify Initial "Start Vote" UI
        // We need to ensure the dashboard renders the VotingManager. 
        // Usually, the dashboard shows "Spin the Jar". 
        // Can we switch to "Voting Mode"? 
        // The SignupForm has "selectionMode". 
        // If we mock the JAR metadata to say `selectionMode: 'VOTE'`, dashboard might auto-show it.

        // Let's Mock Jar Metadata
        await page.route(`**/api/jars/${JAR_ID}`, async route => {
            await route.fulfill({
                json: {
                    id: JAR_ID,
                    name: 'Test Jar',
                    permissions: { isAdmin: true },
                    jar: {
                        selectionMode: 'VOTE',
                        members: [{ userId: 'user_123', role: 'ADMIN' }]
                    }
                }
            });
        });

        // Wait for Voting Manager "Start" UI
        await expect(page.locator('text=Start a Group Vote')).toBeVisible({ timeout: 15000 });

        // 4. Start the Vote
        const startBtn = page.getByRole('button', { name: 'Start Voting Session' });
        await robustClick(page, startBtn);

        // Confirm options modal
        await expect(page.locator('text=Configure the voting session')).toBeVisible();
        const confirmStartBtn = page.getByRole('button', { name: 'Start Vote' });

        // Start the vote in mock state
        voteState.active = true;
        voteState.session = {
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 3600000).toISOString(),
            candidates: ['idea_1', 'idea_2', 'idea_3']
        };

        await robustClick(page, confirmStartBtn);

        // Manually trigger refresh because Server Action failure won't do it
        await page.waitForTimeout(500); // Wait for click handling
        await page.evaluate(() => {
            window.dispatchEvent(new CustomEvent('decision-jar:refresh-all'));
        });

        // 5. Verify Active Vote UI
        await expect(page.locator('text=Cast Your Vote')).toBeVisible();
        await expect(page.locator('text=Tacos')).toBeVisible();

        // Own idea should be disabled/marked?
        // Checking visual cues might be flaky, but Tacos should be clickable.

        // 6. Cast Vote
        const optionTacos = page.locator('text=Tacos').first();
        await robustClick(page, optionTacos); // Select

        const submitVoteBtn = page.getByRole('button', { name: 'Submit Vote' });
        await expect(submitVoteBtn).toBeEnabled();

        // Update mock state for next poll
        voteState.hasVoted = true;
        voteState.votesCast = 1;

        // Update vote state
        voteState.hasVoted = true;

        await robustClick(page, submitVoteBtn);

        // Manually trigger refresh
        await page.waitForTimeout(500);
        await page.evaluate(() => {
            window.dispatchEvent(new CustomEvent('decision-jar:refresh-all'));
        });

        // 7. Verify Voted State
        await expect(page.locator('text=Vote Submitted!')).toBeVisible();
        await expect(page.locator('text=Waiting for others to finish...')).toBeVisible();

        // Prepare Mock for Resolution result
        voteState.active = false;
        voteState.lastResult = {
            winner: { id: 'idea_1', description: 'Tacos', category: 'Food', createdById: 'other_user' },
            votes: {},
            totalVotes: 3
        };

        // 8. Resolve Vote
        // Identify "Resolve" button (Admin Controls)
        const resolveBtn = page.getByRole('button', { name: 'Resolve' });
        await expect(resolveBtn).toBeVisible();

        await robustClick(page, resolveBtn);

        // Manually trigger refresh
        await page.waitForTimeout(500);
        await page.evaluate(() => {
            window.dispatchEvent(new CustomEvent('decision-jar:refresh-all'));
        });

        // 9. Verify Winner Reveal
        // NOTE: The Reveal Modal might appear. Check for text or modal.
        await expect(page.locator('h2', { hasText: /It's Decided!|Idea Details/i })).toBeVisible({ timeout: 15000 });

    });
});
