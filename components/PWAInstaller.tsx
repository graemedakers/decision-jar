'use client';

import { useEffect } from 'react';
import { usePWAAnalytics } from '@/lib/pwa-analytics';

export function PWAInstaller() {
    // Initialize PWA analytics
    usePWAAnalytics();
    useEffect(() => {
        // Skip SW registration if disabled via env
        if (process.env.NEXT_PUBLIC_DISABLE_SW === 'true') {
            console.log('[PWA] Service worker disabled via environment variable');
            return;
        }

        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            // Only register in production or when explicitly enabled
            const shouldRegister = process.env.NODE_ENV === 'production' ||
                process.env.NEXT_PUBLIC_ENABLE_SW === 'true';

            if (!shouldRegister) {
                console.log('[PWA] Service worker skipped in development');
                return;
            }

            console.log('[PWA] Registering service worker...');

            // Register service worker
            navigator.serviceWorker
                .register('/sw.js', { scope: '/' })
                .then((registration) => {
                    console.log('[PWA] Service Worker registered successfully:', registration.scope);

                    // Check for updates periodically
                    setInterval(() => {
                        registration.update().catch((err) => {
                            console.warn('[PWA] Update check failed:', err);
                        });
                    }, 60000); // Check every minute
                })
                .catch((error) => {
                    console.error('[PWA] Service Worker registration FAILED:', error);
                    // Don't throw - let the app continue without SW
                });

            // Listen for install prompt
            // Note: We used to have custom UI logic here, but now we use the global <InstallPrompt /> component
            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                // We rely on the global listener in hooks/usePWA.ts or components/InstallPrompt.tsx
            });

            // Track successful installation
            window.addEventListener('appinstalled', () => {
                console.log('PWA installed successfully!');
                // You can track this with analytics
            });
        }
    }, []);

    return null; // This is a utility component with no UI
}
