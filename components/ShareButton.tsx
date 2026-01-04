'use client';

import { useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ShareButtonProps {
    title: string;
    description: string;
    url?: string;
    className?: string;
}

export function ShareButton({ title, description, url, className = '' }: ShareButtonProps) {
    const [copied, setCopied] = useState(false);
    const [sharing, setSharing] = useState(false);

    const shareUrl = url || typeof window !== 'undefined' ? window.location.origin : 'https://spinthejar.com';

    // Generate share URL with tracking
    const trackingUrl = `${shareUrl}?utm_source=share&utm_medium=social&utm_campaign=ai_concierge`;

    const shareText = `${title}\n\n${description}\n\nFound via Spin the Jar ✨\n${trackingUrl}`;

    const handleShare = async () => {
        setSharing(true);

        try {
            // Check if Web Share API is available
            if (navigator.share) {
                // Use combined format for best compatibility across all platforms
                // This works well for WhatsApp (both mobile and web), Instagram, 
                // Twitter, Messages, and most other sharing destinations
                await navigator.share({
                    text: shareText,
                });
            } else {
                // Fallback: Copy to clipboard
                await navigator.clipboard.writeText(shareText);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        } catch (error) {
            // User cancelled or error occurred
            if (error instanceof Error && error.name !== 'AbortError') {
                console.error('Error sharing:', error);
                // Fallback to copy
                try {
                    await navigator.clipboard.writeText(shareText);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                } catch (clipboardError) {
                    console.error('Could not copy to clipboard:', clipboardError);
                }
            }
        } finally {
            setSharing(false);
        }
    };

    const hasNativeShare = typeof window !== 'undefined' && 'share' in navigator;

    return (
        <Button
            onClick={handleShare}
            disabled={sharing}
            variant="outline"
            className={`flex items-center gap-2 ${className}`}
        >
            {copied ? (
                <>
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Copied!</span>
                </>
            ) : (
                <>
                    {hasNativeShare ? (
                        <Share2 className="w-4 h-4" />
                    ) : (
                        <Copy className="w-4 h-4" />
                    )}
                    <span>{sharing ? 'Sharing...' : 'Share'}</span>
                </>
            )}
        </Button>
    );
}

interface ShareCardProps {
    recommendation: {
        name: string;
        description?: string;
        cuisine?: string;
        address?: string;
        price?: string;
    };
    type: 'restaurant' | 'movie' | 'bar' | 'activity' | 'book';
}

export function ShareCard({ recommendation, type }: ShareCardProps) {
    const getEmoji = () => {
        switch (type) {
            case 'restaurant': return '🍽️';
            case 'movie': return '🎬';
            case 'bar': return '🍸';
            case 'activity': return '✨';
            case 'book': return '📚';
            default: return '✨';
        }
    };

    const getTypeLabel = () => {
        switch (type) {
            case 'restaurant': return 'Restaurant Recommendation';
            case 'movie': return 'Movie Night Pick';
            case 'bar': return 'Bar Recommendation';
            case 'activity': return 'Activity Suggestion';
            case 'book': return 'Book Recommendation';
            default: return 'Recommendation';
        }
    };

    const title = `${getEmoji()} ${recommendation.name}`;
    const details = [
        recommendation.cuisine,
        recommendation.price,
        recommendation.address
    ].filter(Boolean).join(' • ');

    const description = `${getTypeLabel()}: ${recommendation.name}${details ? `\n${details}` : ''}${recommendation.description ? `\n\n${recommendation.description.slice(0, 150)}...` : ''}`;

    return (
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-pink-200 dark:border-pink-800">
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getEmoji()}</span>
                        <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                            {getTypeLabel()}
                        </span>
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                        {recommendation.name}
                    </h4>
                    {details && (
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            {details}
                        </p>
                    )}
                </div>
            </div>

            <ShareButton
                title={title}
                description={description}
                className="w-full"
            />

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
                Share your pick with friends! ✨
            </p>
        </div>
    );
}
