import { useEffect } from 'react';
import { Idea } from '@/lib/types';

interface UseYouTubeMetadataProps {
    isOpen: boolean;
    formData: Partial<Idea>;
    setFormData: (updater: (prev: any) => any) => void;
}

export function useYouTubeMetadata({ isOpen, formData, setFormData }: UseYouTubeMetadataProps) {

    const fetchYouTubeMetadata = async (url: string) => {
        try {
            const response = await fetch(`/api/youtube/metadata?url=${encodeURIComponent(url)}`);
            if (!response.ok) return null;
            const data = await response.json();
            return data;
        } catch (e) {
            console.error("YouTube metadata fetch skipped:", e);
            return null;
        }
    };

    // Auto-detect YouTube metadata for shared links
    useEffect(() => {
        if (!isOpen) return;

        const urlToCheck = formData.details || formData.description;
        const isYouTubeUrl = urlToCheck && (urlToCheck.includes('youtube.com/watch') || urlToCheck.includes('youtu.be/') || urlToCheck.includes('youtube.com/shorts/'));

        if (isYouTubeUrl) {
            const isGenericTitle = !formData.description || formData.description === 'Shared Link' || formData.description === 'YouTube Video';

            // If it's a generic title, we definitely want to fetch
            if (isGenericTitle) {
                // Set loading state immediately in the description field
                if (formData.description !== "Loading video info...") {
                    setFormData(prev => ({ ...prev, description: "Loading video info...", ideaType: 'youtube' }));
                }

                fetchYouTubeMetadata(urlToCheck).then(metadata => {
                    if (metadata) {
                        setFormData(prev => {
                            // Extract video ID if not already present
                            let vId = prev.typeData?.videoId;
                            if (!vId) {
                                const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{10,12})/i;
                                const match = urlToCheck.match(youtubeRegex);
                                if (match) vId = match[1];
                            }

                            return {
                                ...prev,
                                description: metadata.title || prev.description,
                                ideaType: 'youtube',
                                typeData: {
                                    ...prev.typeData,
                                    title: metadata.title,
                                    channelTitle: metadata.authorName,
                                    watchUrl: urlToCheck,
                                    thumbnailUrl: metadata.thumbnailUrl,
                                    videoId: vId
                                }
                            };
                        });
                    }
                });
            }
        }
    }, [isOpen, formData.details, formData.description]);

    return { fetchYouTubeMetadata };
}
