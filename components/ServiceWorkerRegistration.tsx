'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/register-sw';

/**
 * Service Worker Registration Component
 * 
 * Registers the service worker on mount for PWA functionality
 * and push notifications.
 */
export function ServiceWorkerRegistration() {
    useEffect(() => {
        // Register service worker on mount
        registerServiceWorker();
    }, []);

    // This component doesn't render anything
    return null;
}
