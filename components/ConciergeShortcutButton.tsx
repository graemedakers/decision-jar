'use client';

import { useState, useEffect } from 'react';
import { Check, Share2 } from 'lucide-react';
import { Button } from './ui/Button';
import { trackEvent } from '@/lib/analytics';
import { showSuccess, showInfo } from '@/lib/toast';

interface ConciergeShortcutButtonProps {
    toolId: string;
    toolName: string;
    isPremium: boolean;
}

export function ConciergeShortcutButton({ toolId, toolName, isPremium }: ConciergeShortcutButtonProps) {
    const [copied, setCopied] = useState(false);
    const [isPremiumConfirmed, setIsPremiumConfirmed] = useState(isPremium);

    // Check localStorage as fallback for premium status
    useEffect(() => {
        if (!isPremium) {
            try {
                const cached = localStorage.getItem('datejar_is_premium');
                if (cached === 'true') {
                    setIsPremiumConfirmed(true);
                }
            } catch (e) {
                // Ignore storage errors
            }
        } else {
            setIsPremiumConfirmed(true);
        }
    }, [isPremium]);

    // Only show for premium users
    if (!isPremiumConfirmed) return null;

    const handleAddShortcut = async () => {
        const deepLink = `${window.location.origin}/dashboard?action=concierge&tool=${toolId.toLowerCase()}`;
        const iconUrl = `${window.location.origin}/icon-96.png`;

        // Detect platform
        const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);
        const isMobile = isIOS || isAndroid;
        const isWindows = /Windows/.test(navigator.userAgent);

        // Check if Web Share API is available
        const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

        // Track shortcut creation attempt
        trackEvent('concierge_shortcut_created', {
            tool_id: toolId,
            tool_name: toolName,
            method: isMobile ? (canShare ? 'native_share' : 'clipboard') : 'desktop_shortcut',
            platform: isWindows ? 'windows' : isIOS ? 'ios' : isAndroid ? 'android' : 'other'
        });

        // MOBILE: Try native Web Share API first
        if (isMobile && canShare) {
            try {
                await navigator.share({
                    title: `${toolName} - Decision Jar`,
                    text: `Quick access to ${toolName}`,
                    url: deepLink
                });
                showSuccess(`Share successful! Save to your home screen for quick access.`);
                return;
            } catch (err: any) {
                if (err.name === 'AbortError') {
                    return; // User cancelled
                }
                // Fall through to other methods
            }
        }

        // DESKTOP WINDOWS: Generate and download a .url shortcut file
        if (isWindows && !isMobile) {
            try {
                // Use favicon.ico if available (better Windows support), fallback to PNG
                const faviconUrl = `${window.location.origin}/favicon.ico`;
                
                // Create Windows .url shortcut file content
                const shortcutContent = `[InternetShortcut]
URL=${deepLink}
IconFile=${faviconUrl}
IconIndex=0
`;
                // Create blob and trigger download
                const blob = new Blob([shortcutContent], { type: 'application/internet-shortcut' });
                const blobUrl = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = `${toolName.replace(/[^a-zA-Z0-9]/g, '_')}.url`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(blobUrl);

                showSuccess(`✨ Shortcut "${toolName}" downloaded! Drag it to your desktop.`);
                return;
            } catch (err) {
                console.error('Failed to create shortcut file:', err);
                // Fall through to clipboard
            }
        }

        // FALLBACK: Copy to clipboard with instructions
        try {
            await navigator.clipboard.writeText(deepLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);

            if (isIOS) {
                showInfo(`📱 Link copied! To add a shortcut:\n1. Open Safari\n2. Paste the link\n3. Tap Share → Add to Home Screen`);
            } else if (isAndroid) {
                showInfo(`📱 Link copied! To add a shortcut:\n1. Open Chrome\n2. Paste the link\n3. Tap ⋮ → Add to Home Screen`);
            } else {
                showSuccess(`✨ Link copied! Create a bookmark or drag to your bookmarks bar.`);
            }
        } catch (err) {
            showInfo(`Copy this link to bookmark: ${deepLink}`);
        }
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleAddShortcut}
            className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 h-7 px-2"
            title="Add shortcut to home screen"
        >
            {copied ? (
                <><Check className="w-3.5 h-3.5 mr-1 text-emerald-500" /> Copied!</>
            ) : (
                <><Share2 className="w-3.5 h-3.5 mr-1" /> Add Shortcut</>
            )}
        </Button>
    );
}
