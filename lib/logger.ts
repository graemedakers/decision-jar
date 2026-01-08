"use strict";

const IS_DEV = process.env.NODE_ENV === 'development';

export const logger = {
    info: (message: string, meta?: object) => {
        if (IS_DEV) {
            console.log(`[INFO] ${message}`, meta || '');
        }
    },
    error: (message: string, error?: any, meta?: object) => {
        // In production, this would go to Sentry/PostHog
        console.error(`[ERROR] ${message}`, error, meta || '');
    },
    warn: (message: string, meta?: object) => {
        if (IS_DEV) {
            console.warn(`[WARN] ${message}`, meta || '');
        }
    },
    debug: (message: string, meta?: object) => {
        if (IS_DEV) {
            console.debug(`[DEBUG] ${message}`, meta || '');
        }
    }
};
