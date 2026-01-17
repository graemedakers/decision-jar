'use client';

import { useState } from 'react';
import { Home, Check, Share2 } from 'lucide-react';
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

    // Only show for premium users
    if (!isPremium) return null;

    const handleAddShortcut = async () => {
        const deepLink = `${window.location.origin}/dashboard?action=concierge&tool=${toolId.toLowerCase()}`;

        // Track shortcut creation attempt
        trackEvent('concierge_shortcut_created', {
            tool_id: toolId,
            tool_name: toolName,
            method: navigator.share ? 'native_share' : 'clipboard'
        });

        // Try native Web Share API first (best experience on mobile)
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${toolName} - Decision Jar`,
                    text: `Quick access to ${toolName}`,
                    url: deepLink
                });
                showSuccess(`Share successful! Save to your home screen for quick access.`);
                return;
            } catch (err: any) {
                // User cancelled or error - fall through to clipboard
                if (err.name === 'AbortError') {
                    return; // User cancelled, don't show anything
                }
            }
        }

        // Fallback: Copy to clipboard
        try {
            await navigator.clipboard.writeText(deepLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);

            // Show platform-specific instructions
            const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
            const isAndroid = /Android/.test(navigator.userAgent);

            if (isIOS) {
                showInfo(`📱 Link copied! To add a shortcut:\n1. Open Safari\n2. Paste the link\n3. Tap Share → Add to Home Screen`);
            } else if (isAndroid) {
                showInfo(`📱 Link copied! To add a shortcut:\n1. Open Chrome\n2. Paste the link\n3. Tap ⋮ → Add to Home Screen`);
            } else {
                showSuccess(`✨ Link copied! Bookmark this URL for quick access to ${toolName}`);
            }
        } catch (err) {
            // Last resort: show the link in an alert
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
