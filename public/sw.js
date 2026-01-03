// Service Worker for PWA Offline Support
const CACHE_NAME = 'spin-the-jar-v1';
const RUNTIME_CACHE = 'runtime';

// Assets to cache immediately
const PRECACHE_ASSETS = [
    '/',
    '/dashboard',
    '/login',
    '/signup',
    '/icon-192.png',
    '/icon-512.png',
];

// Install event - precache assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(PRECACHE_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((cacheName) => cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE)
                    .map((cacheName) => caches.delete(cacheName))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip chrome extensions and external requests
    if (!event.request.url.startsWith(self.location.origin)) return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return caches.open(RUNTIME_CACHE).then((cache) => {
                return fetch(event.request).then((response) => {
                    // Cache successful responses
                    if (response.status === 200) {
                        cache.put(event.request, response.clone());
                    }
                    return response;
                }).catch(() => {
                    // Return offline page for navigation requests
                    if (event.request.mode === 'navigate') {
                        return caches.match('/offline.html');
                    }
                });
            });
        })
    );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-ideas') {
        event.waitUntil(syncIdeas());
    }
});

async function syncIdeas() {
    // Placeholder for syncing offline-created ideas
    console.log('Syncing ideas from offline storage');
}

// Push notifications support (for future use)
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'New update available!',
        icon: '/icon-192.png',
        badge: '/icon-72.png',
        vibrate: [200, 100, 200],
    };

    event.waitUntil(
        self.registration.showNotification('Spin the Jar', options)
    );
});
