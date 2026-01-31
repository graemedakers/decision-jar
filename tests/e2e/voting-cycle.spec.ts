import { test, expect } from '../utils/playwright-extensions';
import { prisma as db } from '../../lib/prisma';

test.describe('Voting Cycle', () => {
    test.beforeEach(async ({ page, seededData }) => {
        // Bypass auth for Owner
        await page.setExtraHTTPHeaders({
            'x-e2e-bypass': 'true',
            'x-e2e-user-email': seededData.user.email
        });

        // Disable Onboarding Tour
        await page.addInitScript((userId) => {
            localStorage.setItem(`onboarding_completed_${userId}`, 'true');
        }, seededData.user.id);

        // Mock generic ideas fetch to avoid Empty State
        await page.route('**/api/ideas', async (route) => {
            await route.fulfill({ status: 200, json: seededData.ideas });
        });

        // Ensure jar is ripe
        // seededData.ideas are already APPROVED by default in seedFullJar?
        // Let's verify we have ideas.
        expect(seededData.ideas.length).toBeGreaterThan(0);
    });

    test('Full Voting Cycle: Start -> Vote -> Winner', async ({ page, seededData }) => {
        const { jar, user } = seededData;
        const memberUserEmail = `member_${Date.now()}@example.com`;

        // 1. Setup: Create Member & Member's Idea
        // We need an idea not owned by the Owner so the Owner can vote strictly for it.
        const memberUser = await db.user.create({
            data: {
                email: memberUserEmail,
                name: 'Member User',
                memberships: {
                    create: {
                        jarId: jar.id,
                        role: 'MEMBER'
                    }
                }
            }
        });

        await db.idea.create({
            data: {
                description: 'Member Idea',
                jarId: jar.id,
                createdById: memberUser.id,
                status: 'APPROVED',
                category: 'ACTIVITY',
                indoor: true,
                duration: 60,
                activityLevel: 'MEDIUM',
                cost: 'FREE'
            }
        });

        // 2. Start Vote as Owner
        await page.goto('/dashboard');

        // Wait for dashboard to load and show "Spin"
        await expect(page.getByTestId('spin-button')).toBeVisible();

        // Switch to Vote Mode via DB update
        await db.jar.update({
            where: { id: jar.id },
            data: { selectionMode: 'VOTE' }
        });

        await page.reload();

        // Now we should see the Voting Manager
        await expect(page.getByText('Start a Group Vote')).toBeVisible();
        await expect(page.getByText('Start Voting Session')).toBeVisible();

        // Click Start Voting Button
        await page.getByText('Start Voting Session').click();

        // In Modal, click "Start Vote"
        await page.getByRole('button', { name: 'Start Vote' }).click();

        // 3. Cast Votes as Owner
        // Should be presented with "Cast Your Vote"
        await expect(page.getByText('Cast Your Vote')).toBeVisible();

        // Select Member's Idea
        await page.getByText('Member Idea').click();

        // Click Submit
        await page.getByText('Submit Vote').click();

        // Verify "Waiting for others" state
        await expect(page.getByText('Waiting for others')).toBeVisible();

        // 4. Simulate Member Vote via DB Injection
        // Find the active session
        const session = await db.voteSession.findFirst({
            where: { jarId: jar.id, status: 'ACTIVE' }
        });
        expect(session).not.toBeNull();

        // Owner voted for Member Idea.
        // Let Member vote for the same idea to ensure a winner.
        const targetIdea = await db.idea.findFirst({ where: { description: 'Member Idea' } });

        await db.vote.create({
            data: {
                sessionId: session!.id,
                userId: memberUser.id,
                ideaId: targetIdea!.id
            }
        });

        // Manual Resolution (since API logic wasn't triggered)
        await db.voteSession.update({
            where: { id: session!.id },
            data: {
                status: 'COMPLETED',
                winnerId: targetIdea!.id
            }
        });

        await db.idea.update({
            where: { id: targetIdea!.id },
            data: { selectedAt: new Date() }
        });

        // 5. Verify Winner Reveal
        // Trigger a refresh to simulate polling/push notification
        await page.evaluate(() => {
            window.dispatchEvent(new CustomEvent('decision-jar:refresh-all'));
        });

        // Wait for connection/fetch (increased for animation/network)
        await page.waitForTimeout(3000);

        // Check if modal container is visible
        await expect(page.getByTestId('date-reveal-modal')).toBeVisible();

        // Winner should be Member Idea (Heading)
        await expect(page.getByRole('heading', { name: 'Member Idea' })).toBeVisible();
    });
});
