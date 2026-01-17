/**
 * Service Worker Registration
 * 
 * Registers the service worker for PWA functionality and push notifications.
 * Should be called once on app initialization.
 */

export async function registerServiceWorker() {
    // Only register in browser and if supported
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        console.log('[SW] Service workers not supported');
        return null;
    }

    // Don't register during SSR
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        console.log('[SW] Registering service worker...');
        
        const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none', // Always check for updates
        });

        console.log('[SW] Service worker registered successfully:', registration.scope);

        // Check for updates on page load
        registration.update();

        // Listen for updates
        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            console.log('[SW] New service worker found, installing...');

            newWorker?.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('[SW] New service worker installed, refresh to activate');
                }
            });
        });

        return registration;
    } catch (error) {
        console.error('[SW] Service worker registration failed:', error);
        return null;
    }
}

/**
 * Unregister all service workers (for development/debugging)
 */
export async function unregisterServiceWorker() {
    if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
            await registration.unregister();
            console.log('[SW] Unregistered service worker');
        }
    }
}
