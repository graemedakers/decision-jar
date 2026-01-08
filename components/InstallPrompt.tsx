'use client';

import { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';
import { Button } from './ui/Button';
import { trackPWAEvent, isPWAMode } from '@/lib/pwa-analytics';

export function InstallPrompt() {
    const [showPrompt, setShowPrompt] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Check if already installed
        const isStandalone = isPWAMode();
        // Relaxed Logic: Prompt every 7 days, not permanently dismissed
        const lastPrompt = localStorage.getItem('pwa-last-prompted');
        const now = Date.now();
        const COOLDOWN = 7 * 24 * 60 * 60 * 1000; // 7 days

        if (isStandalone || (lastPrompt && now - parseInt(lastPrompt) < COOLDOWN)) {
            return;
        }

        // Detect iOS
        const ua = window.navigator.userAgent.toLowerCase();
        const ios = /iphone|ipad|ipod/.test(ua);
        setIsIOS(ios);

        // Logic for Android/Chrome (supports beforeinstallprompt)
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);

            // Show prompt after 5 seconds of usage (reduced from 15)
            setTimeout(() => {
                setShowPrompt(true);
            }, 5000);
        };

        // Logic for iOS (does NOT support beforeinstallprompt)
        if (ios) {
            setTimeout(() => {
                setShowPrompt(true);
            }, 8000); // 8s for iOS
        }

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
            trackPWAEvent('pwa_install_accepted');
        } else {
            trackPWAEvent('pwa_install_rejected');
        }

        setDeferredPrompt(null);
        setShowPrompt(false);
        localStorage.setItem('pwa-last-prompted', Date.now().toString());
    };

    const handleDismiss = () => {
        trackPWAEvent('pwa_install_dismissed');
        setShowPrompt(false);
        localStorage.setItem('pwa-last-prompted', Date.now().toString());
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-6 inset-x-4 z-[60] md:bottom-8 md:right-8 md:left-auto md:w-[400px] animate-in slide-in-from-bottom-10 fade-in duration-700">
            <div className="glass-card bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-xl border border-white/10 p-5 rounded-[1.5rem] shadow-2xl relative overflow-hidden ring-1 ring-white/20">
                {/* Background Sparkles */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />

                <button
                    onClick={handleDismiss}
                    className="absolute top-4 right-4 p-2 rounded-full bg-black/10 hover:bg-black/20 text-white/70 hover:text-white transition-colors z-10"
                    aria-label="Dismiss"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex items-start gap-4 relative z-10">
                    <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl shrink-0 shadow-inner">
                        <Download className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex-1">
                        <h3 className="text-white font-black text-xl mb-1 tracking-tight">
                            Decision Jar Pro
                        </h3>
                        <p className="text-white/80 text-sm mb-4 leading-relaxed font-medium">
                            {isIOS
                                ? "Add to your Home Screen for the full app experience and offline access!"
                                : "Install our app for instant access, offline mode, and a smoother experience!"
                            }
                        </p>

                        {isIOS ? (
                            <div className="bg-black/20 rounded-2xl p-4 mb-2 border border-white/5">
                                <p className="text-white text-xs font-bold uppercase tracking-wider mb-3 opacity-60">How to Install:</p>
                                <ol className="text-white/90 text-sm space-y-3">
                                    <li className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">1</div>
                                        <span>Tap the <span className="inline-flex items-center justify-center p-1 bg-white/10 rounded mx-1"><Share className="w-3 h-3" /></span> <strong>Share</strong> icon</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">2</div>
                                        <span>Select <strong>'Add to Home Screen'</strong></span>
                                    </li>
                                </ol>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleInstall}
                                    className="bg-white text-purple-600 hover:bg-white/90 font-bold flex-1 h-12 rounded-xl border-none shadow-lg"
                                >
                                    Install Now
                                </Button>
                            </div>
                        )}

                        {!isIOS && (
                            <button
                                onClick={handleDismiss}
                                className="w-full text-center text-white/50 text-xs font-bold py-2 hover:text-white/80 transition-colors uppercase tracking-widest mt-2"
                            >
                                Not Right Now
                            </button>
                        )}

                        {isIOS && (
                            <button
                                onClick={handleDismiss}
                                className="w-full h-12 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors mt-2 border border-white/10"
                            >
                                Got it
                            </button>
                        )}
                    </div>
                </div>

                {/* Features List (Desktop/Large only) */}
                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between">
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-white/40 uppercase">Offline</span>
                        <div className="w-1 h-1 bg-green-400 rounded-full mt-1" />
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-white/40 uppercase">Speed</span>
                        <div className="w-1 h-1 bg-blue-400 rounded-full mt-1" />
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-white/40 uppercase">Native</span>
                        <div className="w-1 h-1 bg-purple-400 rounded-full mt-1" />
                    </div>
                </div>
            </div>
        </div>
    );
}
