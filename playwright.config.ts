
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        baseURL: 'http://localhost:3001',
        trace: 'on-first-retry',
        video: 'on-first-retry',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    // webServer: {
    //     command: 'npx next dev . --webpack',
    //     url: 'http://localhost:3000',
    //     reuseExistingServer: true,
    //     env: {
    //         NEXTAUTH_URL: 'http://localhost:3000',
    //         AUTH_TRUST_HOST: 'true'
    //     }
    // },
});
