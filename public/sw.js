// Service Worker for PWA - Simplified and Safe Version
const CACHE_NAME = 'decision-jar-v4';
const RUNTIME_CACHE = 'runtime-v4';

// Only cache static assets, not pages
const PRECACHE_ASSETS = [
    '/icon-192.png',
    '/icon-512.png',
    '/offline.html',
];

// Install event - precache only essential assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(async (cache) => {
                console.log('[SW] Caching static assets');
                // Cache assets individually to avoid installation failure
                const cachePromises = PRECACHE_ASSETS.map(async (asset) => {
                    try {
                        await cache.add(asset);
                        console.log('[SW] Cached:', asset);
                    } catch (error) {
                        console.warn('[SW] Failed to cache:', asset, error);
                        // Don't fail the entire installation if one asset fails
                    }
                });
                await Promise.allSettled(cachePromises);
            })
            .then(() => {
                console.log('[SW] Skip waiting');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] Install failed:', error);
                // Still skip waiting even if caching failed
                return self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker...');
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cacheName) => {
                            return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
                        })
                        .map((cacheName) => {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => {
                console.log('[SW] Claiming clients');
                return self.clients.claim();
            })
    );
});

// Fetch event - Network first, then cache
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip Chrome extensions and non-HTTP(S) requests
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // Allow cross-origin requests for images from trusted domains
    const isTrustedImageDomain =
        url.hostname === 'res.cloudinary.com' ||
        url.hostname === 'lh3.googleusercontent.com' ||
        url.hostname === 'photos.app.goo.gl';

    // Skip cross-origin requests EXCEPT for trusted image domains
    if (url.origin !== self.location.origin && !isTrustedImageDomain) {
        return;
    }

    // Skip API routes - NEVER cache these
    if (url.pathname.startsWith('/api/')) {
        console.log('[SW] Skipping API route:', url.pathname);
        return;
    }

    // Network-first strategy for everything
    event.respondWith(
        fetch(request)
            .then((response) => {
                // Don't cache if not successful
                if (!response || response.status !== 200 || response.type === 'error') {
                    return response;
                }

                // Clone the response
                const responseToCache = response.clone();

                // Only cache static assets (images, fonts, etc.)
                if (
                    url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|woff2?|ttf|eot)$/)
                ) {
                    caches.open(RUNTIME_CACHE).then((cache) => {
                        cache.put(request, responseToCache);
                    });
                }

                return response;
            })
            .catch((error) => {
                console.log('[SW] Fetch failed, checking cache:', url.pathname);

                // Try cache
                return caches.match(request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }

                    // If navigation request and offline, show offline page
                    if (request.mode === 'navigate') {
                        return caches.match('/offline.html');
                    }

                    // Otherwise, let it fail
                    return new Response('Network error', {
                        status: 408,
                        headers: { 'Content-Type': 'text/plain' },
                    });
                });
            })
    );
});

// Log any errors
self.addEventListener('error', (event) => {
    console.error('[SW] Error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('[SW] Unhandled rejection:', event.reason);
});

console.log('[SW] Service worker loaded');

// --- Push Notification Handling ---

self.addEventListener('push', function (event) {
    if (!event.data) {
        console.log('[SW] Push event but no data');
        return;
    }

    try {
        const payload = event.data.json();
        const { title, body, icon, url, tag } = payload;

        const options = {
            body: body,
            icon: icon || '/icon-192.png',
            badge: '/icon-96.png', // Android specific (small icon)
            vibrate: [100, 50, 100],
            data: {
                url: url
            },
            tag: tag || 'general-notification'
        };

        event.waitUntil(
            self.registration.showNotification(title, options)
        );
    } catch (e) {
        console.error('[SW] Error parsing push data', e);
    }
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    const urlToOpen = event.notification.data?.url || '/dashboard';

    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then(function (clientList) {
            // Check if window is already open
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url.includes(urlToOpen) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
