import { Page } from '@playwright/test';

/**
 * Common AI endpoints used in the application.
 */
export const AI_ENDPOINTS = {
    CONCIERGE: '**/api/concierge',
    BULK_GENERATE: '**/api/ideas/bulk-generate',
    MAGIC_IDEA: '**/api/magic-idea',
};

/**
 * Standardizes AI mock patterns for consistent testing of success and failure cases.
 */
export class AIMockReporter {
    constructor(private page: Page) { }

    /**
     * Mocks a successful AI response.
     */
    async mockSuccess(endpoint: string, data: any) {
        await this.page.route(endpoint, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(data),
            });
        });
    }

    /**
     * Mocks an AI timeout/delayed response.
     */
    async mockTimeout(endpoint: string, delayMs: number = 30000) {
        await this.page.route(endpoint, async (route) => {
            await new Promise(resolve => setTimeout(resolve, delayMs));
            await route.abort('timedout');
        });
    }

    /**
     * Mocks a malformed JSON response.
     */
    async mockMalformedJson(endpoint: string) {
        await this.page.route(endpoint, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: '{ "invalid": json.. ',
            });
        });
    }

    /**
     * Mocks an empty results response.
     */
    async mockEmptyResults(endpoint: string) {
        await this.page.route(endpoint, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ recommendations: [], ideas: [], count: 0 }),
            });
        });
    }

    /**
     * Mocks a rate limit error (429).
     */
    async mockRateLimit(endpoint: string) {
        await this.page.route(endpoint, async (route) => {
            await route.fulfill({
                status: 429,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Too many requests' }),
            });
        });
    }

    /**
     * Mocks a generic server error (500).
     */
    async mockServerError(endpoint: string) {
        await this.page.route(endpoint, async (route) => {
            await route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Internal server error' }),
            });
        });
    }
}
