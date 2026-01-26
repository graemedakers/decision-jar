import React from 'react';
import { YouTubeTypeData } from '@/lib/types/idea-types';
import { ExternalLink, Youtube, Loader2, Sparkles } from 'lucide-react';
import { useIdeaMutations } from '@/hooks/mutations/useIdeaMutations';

interface YouTubeDetailsProps {
    data: YouTubeTypeData;
    idea?: any;
}

export const YouTubeDetails: React.FC<YouTubeDetailsProps> = ({ data, idea }) => {
    const extractId = (url: string | undefined | null) => {
        if (!url) return null;
        // Decode URL first in case it has search result wrappers
        let decoded = url;
        try {
            if (url.includes('google.com/url?')) {
                const searchParams = new URL(url).searchParams;
                decoded = searchParams.get('q') || url;
            }
        } catch (e) { }

        const match = decoded.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i);
        return match ? match[1] : null;
    };

    let { videoId: rawVideoId, watchUrl, channelTitle, vibe } = data;

    // Fallback extraction from any available field
    const videoId = rawVideoId || extractId(watchUrl) || extractId((data as any).website) || extractId(idea?.website) || extractId(idea?.details) || extractId(idea?.description);

    // Ensure watchUrl is always a direct link if we have an ID
    const effectiveWatchUrl = watchUrl || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : undefined);

    const [isResolving, setIsResolving] = React.useState(false);
    const { updateIdea } = useIdeaMutations();

    React.useEffect(() => {
        const autoResolve = async () => {
            // If we already have a videoId, we are good!
            if (videoId || isResolving || !idea?.id) return;

            // If we have a watchUrl that contains a videoId, extract it instead of searching
            if (watchUrl && (watchUrl.includes('v=') || watchUrl.includes('youtu.be/'))) {
                let extractedId = '';
                if (watchUrl.includes('v=')) {
                    extractedId = watchUrl.split('v=')[1].split('&')[0];
                } else if (watchUrl.includes('youtu.be/')) {
                    extractedId = watchUrl.split('youtu.be/')[1].split('?')[0];
                }

                if (extractedId && extractedId.length === 11) {
                    await updateIdea.mutateAsync({
                        id: idea.id,
                        data: {
                            ideaType: 'youtube',
                            typeData: { ...data, videoId: extractedId }
                        }
                    });
                    return;
                }
            }

            // Only auto-resolve if it's a search-style URL or missing videoId entirely
            const isSearchLink = watchUrl?.includes('youtube.com/results') || !videoId;
            if (!isSearchLink) return;

            setIsResolving(true);
            try {
                const query = idea.description || "YouTube Video";
                const res = await fetch(`/api/youtube/resolve?q=${encodeURIComponent(query)}`);
                if (res.ok) {
                    const resolved = await res.json();
                    if (resolved.videoId) {
                        // Update the idea in the database
                        await updateIdea.mutateAsync({
                            id: idea.id,
                            data: {
                                ideaType: 'youtube',
                                typeData: {
                                    ...data,
                                    videoId: resolved.videoId,
                                    title: resolved.title || idea.description,
                                    channelTitle: resolved.authorName || data.channelTitle,
                                    thumbnailUrl: resolved.thumbnailUrl || data.thumbnailUrl,
                                    watchUrl: `https://www.youtube.com/watch?v=${resolved.videoId}`
                                }
                            }
                        });
                    }
                }
            } catch (e) {
                console.error("Auto-resolve failed:", e);
            } finally {
                setIsResolving(false);
            }
        };

        autoResolve();
    }, [videoId, idea?.id, idea?.description]);

    const handleSearch = () => {
        const query = idea?.description || "YouTube Video";
        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, '_blank');
    };

    if (!videoId) {
        return (
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center space-y-4">
                <div className="relative w-16 h-16 mx-auto">
                    <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full animate-pulse" />
                    {isResolving ? (
                        <div className="absolute inset-0 flex items-center justify-center relative z-10">
                            <Loader2 className="w-10 h-10 text-white animate-spin" />
                            <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-1 -right-1 animate-bounce" />
                        </div>
                    ) : (
                        <Youtube className="w-16 h-16 text-white/20 relative z-10" />
                    )}
                </div>
                <div className="space-y-1">
                    <p className="text-white font-bold text-lg">
                        {isResolving ? "Finding video..." : "YouTube Search Ready"}
                    </p>
                    <p className="text-white/60 text-xs px-8 leading-relaxed">
                        {isResolving
                            ? "AI is finding the perfect match..."
                            : "To guarantee a working video, we've prepared a search for this topic."}
                    </p>
                </div>
                {!isResolving && (
                    <div className="flex flex-col gap-3 pt-4 w-full max-w-[280px] mx-auto">
                        <button
                            onClick={handleSearch}
                            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-black transition-all shadow-lg shadow-red-600/40 hover:scale-[1.02] active:scale-95"
                        >
                            <Youtube className="w-5 h-5" /> Search on YouTube
                        </button>
                        {effectiveWatchUrl && (
                            <a
                                href={effectiveWatchUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-bold transition-all"
                            >
                                <ExternalLink className="w-3.5 h-3.5" /> View Results Link
                            </a>
                        )}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Embed Player */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/40 border border-white/10 shadow-2xl group">
                <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                ></iframe>
            </div>

            {/* Metadata Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                        <Youtube className="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                        {channelTitle && (
                            <p className="text-white font-medium">{channelTitle}</p>
                        )}
                        {vibe && (
                            <p className="text-white/60 text-xs uppercase tracking-wider">{vibe}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleSearch}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 transition-colors text-xs font-medium"
                        title="Search for a different version of this video"
                    >
                        Search
                    </button>
                    <a
                        href={effectiveWatchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition-colors"
                    >
                        <span className="text-xs font-medium">Watch on YouTube</span>
                        <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            </div>
        </div>
    );
};
