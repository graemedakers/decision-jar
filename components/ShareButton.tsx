import { useState } from 'react';
import { Share2, Copy, Check, Link as LinkIcon, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuLabel
} from '@/components/ui/DropdownMenu';
import { trackShareClicked } from '@/lib/analytics';
import { APP_URL } from '@/lib/config';

interface ShareButtonProps {
    title: string;
    description: string;
    url?: string;
    className?: string;
    source?: string; // e.g., 'dining_concierge', 'bar_concierge'
    contentType?: string; // e.g., 'restaurant', 'bar'
}

export function ShareButton({ title, description, url, className = '', source = 'unknown', contentType = 'recommendation' }: ShareButtonProps) {
    const [copiedText, setCopiedText] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    const shareUrl = url || (typeof window !== 'undefined' ? window.location.origin : APP_URL);
    const trackingUrl = `${shareUrl}?utm_source=share&utm_medium=social&utm_campaign=ai_concierge`;
    const shareText = `${title}\n\n${description}\n\nFound via Spin the Jar ✨\n${trackingUrl}`;

    const handleCopyText = async () => {
        try {
            await navigator.clipboard.writeText(shareText);
            setCopiedText(true);
            setTimeout(() => setCopiedText(false), 2000);
            trackShareClicked(source, `${contentType}_copy_text`);
        } catch (err) {
            console.error('Failed to copy text', err);
        }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(trackingUrl);
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2000);
            trackShareClicked(source, `${contentType}_copy_link`);
        } catch (err) {
            console.error('Failed to copy link', err);
        }
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: shareText,
                    url: trackingUrl
                });
                trackShareClicked(source, `${contentType}_native`);
            } catch (err) {
                console.error('Error sharing:', err);
            }
        }
    };

    // On mobile, native share is usually best. On desktop, dropdown is better.
    // However, to be consistent and solve the user's "minimal options" complaint on desktop,
    // (and since we can't perfectly feature-detect "good" native share),
    // we will ALWAYS show the dropdown, but "Share via App..." will trigger the native sheet.

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className={`flex items-center gap-2 ${className}`}
                >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Share Options</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={handleCopyText} className="cursor-pointer">
                    {copiedText ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                    <span>Copy Full Details</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
                    {copiedLink ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <LinkIcon className="w-4 h-4 mr-2" />}
                    <span>Copy Link Only</span>
                </DropdownMenuItem>

                {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleNativeShare} className="cursor-pointer">
                            <Smartphone className="w-4 h-4 mr-2" />
                            <span>Share via App...</span>
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
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
