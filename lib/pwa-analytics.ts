'use client';

import { useEffect } from 'react';

/**
 * PWA Analytics - Tracks installation and usage metrics
 */
export function usePWAAnalytics() {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Track if running as installed PWA
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone ||
            document.referrer.includes('android-app://');

        if (isStandalone) {
            trackEvent('pwa_launch', {
                display_mode: 'standalone',
                platform: getPlatform()
            });
        }

        // Track install prompt shown
        window.addEventListener('beforeinstallprompt', (e) => {
            trackEvent('pwa_install_prompt_shown', {
                platform: getPlatform()
            });
        });

        // Track successful installation
        window.addEventListener('appinstalled', () => {
            trackEvent('pwa_installed', {
                platform: getPlatform(),
                timestamp: new Date().toISOString()
            });

            // Store installation date
            localStorage.setItem('pwa_install_date', new Date().toISOString());
        });

        // Track service worker updates
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then((registration) => {
                registration.addEventListener('updatefound', () => {
                    trackEvent('pwa_update_found', {
                        scope: registration.scope
                    });
                });
            });
        }

        // Track offline usage
        window.addEventListener('online', () => {
            trackEvent('pwa_back_online');
        });

        window.addEventListener('offline', () => {
            trackEvent('pwa_went_offline');
        });

    }, []);
}

/**
 * Track custom PWA events
 */
export function trackPWAEvent(
    eventName: string,
    properties?: Record<string, any>
) {
    trackEvent(eventName, {
        ...properties,
        pwa_mode: isPWAMode(),
        platform: getPlatform()
    });
}

import { logger } from "@/lib/logger";

/**
 * Internal tracking function - sends to your analytics provider
 */
function trackEvent(eventName: string, properties?: Record<string, any>) {
    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
        logger.info('📊 PWA Analytics:', { eventName, properties });
    }

    // Google Analytics (if available)
    if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', eventName, properties);
    }

    // Vercel Analytics (if available)
    if (typeof window !== 'undefined' && (window as any).va) {
        (window as any).va('track', eventName, properties);
    }

    // PostHog (if available)
    if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture(eventName, properties);
    }

    // Custom analytics endpoint (optional)
    if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
        fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                event: eventName,
                properties,
                timestamp: new Date().toISOString()
            })
        }).catch(() => {
            // Silently fail - don't break app if analytics is down
        });
    }
}

/**
 * Check if app is running in PWA mode
 */
export function isPWAMode(): boolean {
    if (typeof window === 'undefined') return false;

    return window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes('android-app://');
}

/**
 * Get user's platform
 */
function getPlatform(): string {
    if (typeof window === 'undefined') return 'unknown';

    const ua = window.navigator.userAgent.toLowerCase();

    if (/iphone|ipad|ipod/.test(ua)) return 'ios';
    if (/android/.test(ua)) return 'android';
    if (/windows/.test(ua)) return 'windows';
    if (/mac/.test(ua)) return 'mac';
    if (/linux/.test(ua)) return 'linux';

    return 'unknown';
}

/**
 * Get PWA statistics
 */
export function getPWAStats() {
    if (typeof window === 'undefined') return null;

    const installDate = localStorage.getItem('pwa_install_date');
    const isInstalled = isPWAMode();

    return {
        isInstalled,
        installDate: installDate ? new Date(installDate) : null,
        platform: getPlatform(),
        hasServiceWorker: 'serviceWorker' in navigator,
        isOnline: navigator.onLine
    };
}
