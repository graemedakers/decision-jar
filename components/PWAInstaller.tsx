'use client';

import { useEffect } from 'react';

export function PWAInstaller() {
    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            // Register service worker
            navigator.serviceWorker
                .register('/sw.js')
                .then((registration) => {
                    console.log('Service Worker registered:', registration);

                    // Check for updates periodically
                    setInterval(() => {
                        registration.update();
                    }, 60000); // Check every minute
                })
                .catch((error) => {
                    console.error('Service Worker registration failed:', error);
                });

            // Listen for install prompt
            let deferredPrompt: any;

            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                deferredPrompt = e;

                // Show custom install button (you can create a UI for this)
                const installBtn = document.getElementById('pwa-install-btn');
                if (installBtn) {
                    installBtn.style.display = 'block';
                    installBtn.addEventListener('click', () => {
                        installBtn.style.display = 'none';
                        deferredPrompt.prompt();
                        deferredPrompt.userChoice.then((choiceResult: any) => {
                            if (choiceResult.outcome === 'accepted') {
                                console.log('User accepted the install prompt');
                            }
                            deferredPrompt = null;
                        });
                    });
                }
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
