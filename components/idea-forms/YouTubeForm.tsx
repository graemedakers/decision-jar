import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Youtube } from 'lucide-react';

interface YouTubeFormProps {
    initialData?: any;
    onChange: (data: any) => void;
}

export const YouTubeForm: React.FC<YouTubeFormProps> = ({ initialData, onChange }) => {
    const [formData, setFormData] = useState({
        videoId: initialData?.videoId || '',
        watchUrl: initialData?.watchUrl || '',
        channelTitle: initialData?.channelTitle || '',
        vibe: initialData?.vibe || ''
    });

    const handleChange = (field: string, value: string) => {
        const newData = { ...formData, [field]: value };

        // Auto-extract ID if URL changes
        if (field === 'watchUrl' && value) {
            const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{10,12})/i;
            const match = value.match(youtubeRegex);
            if (match) {
                newData.videoId = match[1];
            }
        }

        setFormData(newData);
        onChange(newData);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                    <Youtube className="w-4 h-4 text-red-500" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">YouTube Video Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">YouTube URL</label>
                    <Input
                        value={formData.watchUrl}
                        onChange={(e) => handleChange('watchUrl', e.target.value)}
                        placeholder="https://youtube.com/watch?v=..."
                        className="glass-input"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Video ID</label>
                    <Input
                        value={formData.videoId}
                        onChange={(e) => handleChange('videoId', e.target.value)}
                        placeholder="e.g. dQw4w9WgXcQ"
                        className="glass-input"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Channel Name (Optional)</label>
                    <Input
                        value={formData.channelTitle}
                        onChange={(e) => handleChange('channelTitle', e.target.value)}
                        placeholder="e.g. Rick Astley"
                        className="glass-input"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Vibe (Optional)</label>
                    <Input
                        value={formData.vibe}
                        onChange={(e) => handleChange('vibe', e.target.value)}
                        placeholder="e.g. High Energy, Chill"
                        className="glass-input"
                    />
                </div>
            </div>
        </div>
    );
};
