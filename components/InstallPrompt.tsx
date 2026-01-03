'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from './ui/Button';
import { trackPWAEvent } from '@/lib/pwa-analytics';

export function InstallPrompt() {
    const [showPrompt, setShowPrompt] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    useEffect(() => {
        // Check if already installed
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const hasPromptedBefore = localStorage.getItem('pwa-install-prompted');

        if (isStandalone || hasPromptedBefore) {
            return;
        }

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);

            // Show prompt after 30 seconds of usage
            setTimeout(() => {
                setShowPrompt(true);
            }, 30000);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
            trackPWAEvent('pwa_install_accepted');
        } else {
            trackPWAEvent('pwa_install_rejected');
        }

        setDeferredPrompt(null);
        setShowPrompt(false);
        localStorage.setItem('pwa-install-prompted', 'true');
    };

    const handleDismiss = () => {
        trackPWAEvent('pwa_install_dismissed');
        setShowPrompt(false);
        localStorage.setItem('pwa-install-prompted', 'true');
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-slide-up">
            <div className="glass-card bg-gradient-to-r from-pink-600 to-purple-600 p-4 rounded-2xl shadow-2xl border border-white/20">
                <button
                    onClick={handleDismiss}
                    className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 transition-colors"
                    aria-label="Dismiss"
                >
                    <X className="w-4 h-4 text-white" />
                </button>

                <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/20 rounded-xl shrink-0">
                        <Download className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex-1">
                        <h3 className="text-white font-bold text-lg mb-1">
                            Install Spin the Jar
                        </h3>
                        <p className="text-white/90 text-sm mb-4">
                            Add to your home screen for quick access and offline use!
                        </p>

                        <div className="flex gap-2">
                            <Button
                                onClick={handleInstall}
                                className="bg-white text-purple-600 hover:bg-white/90 font-semibold flex-1"
                                size="sm"
                            >
                                Install App
                            </Button>
                            <Button
                                onClick={handleDismiss}
                                variant="ghost"
                                className="text-white hover:bg-white/20 border border-white/30"
                                size="sm"
                            >
                                Not Now
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Features List */}
                <div className="mt-3 pt-3 border-t border-white/20">
                    <ul className="text-white/80 text-xs space-y-1">
                        <li className="flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-white/60" />
                            Works offline
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-white/60" />
                            Faster loading times
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-white/60" />
                            Native app experience
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
