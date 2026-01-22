import React from 'react';
import { Button } from "@/components/ui/Button";
import { ExternalLink, Play, Search, Utensils, Video, Gamepad2, Tv } from "lucide-react";

interface IdeaTypeActionsProps {
    type: string;
    data: any;
    title: string;
}

export function IdeaTypeActions({ type, data, title }: IdeaTypeActionsProps) {
    if (!type) return null;

    const handleSearch = (query: string, suffix: string = "") => {
        window.open(`https://www.google.com/search?q=${encodeURIComponent(query + " " + suffix)}`, '_blank');
    };

    const handleYouTube = (query: string) => {
        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, '_blank');
    };

    switch (type) {
        case 'movie':
            // NEW: Check for direct IMDb link
            const hasImdb = data?.imdbLink;
            return (
                <div className="grid grid-cols-2 gap-3 mt-4">
                    <Button
                        onClick={() => handleYouTube(`${title} trailer`)}
                        className="bg-red-600 hover:bg-red-700 text-white border-none"
                    >
                        <Video className="w-4 h-4 mr-2" />
                        Watch Trailer
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => hasImdb ? window.open(data.imdbLink, '_blank') : handleSearch(title, "review imdb")}
                        className="border-slate-200 dark:border-slate-700"
                    >
                        {hasImdb ? <ExternalLink className="w-4 h-4 mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                        {hasImdb ? "IMDb" : "Reviews"}
                    </Button>
                </div>
            );

        case 'game':
            return (
                <div className="grid grid-cols-2 gap-3 mt-4">
                    <Button
                        onClick={() => handleSearch(title, "gameplay")}
                        className="bg-purple-600 hover:bg-purple-700 text-white border-none"
                    >
                        <Gamepad2 className="w-4 h-4 mr-2" />
                        Gameplay
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => handleSearch(title, "how to play")}
                        className="border-slate-200 dark:border-slate-700"
                    >
                        <Search className="w-4 h-4 mr-2" />
                        How to Play
                    </Button>
                </div>
            );

        case 'recipe':
            const hasSource = data?.sourceUrl;
            return (
                <div className="grid grid-cols-2 gap-3 mt-4">
                    {hasSource && (
                        <Button
                            onClick={() => window.open(data.sourceUrl, '_blank')}
                            className="bg-orange-500 hover:bg-orange-600 text-white border-none"
                        >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Source
                        </Button>
                    )}
                    <Button
                        onClick={() => handleYouTube(`${title} recipe`)}
                        variant={hasSource ? "outline" : "primary"}
                        className={!hasSource ? "bg-red-600 hover:bg-red-700 text-white border-none col-span-2" : "border-slate-200 dark:border-slate-700"}
                    >
                        <Video className="w-4 h-4 mr-2" />
                        Video Recipe
                    </Button>
                </div>
            );

        case 'book':
            // NEW: Check for direct Goodreads link
            const hasGoodreads = data?.goodreadsLink;
            return (
                <div className="grid grid-cols-2 gap-3 mt-4">
                    <Button
                        onClick={() => handleSearch(title, "book summary")}
                        className="bg-blue-600 hover:bg-blue-700 text-white border-none"
                    >
                        <Search className="w-4 h-4 mr-2" />
                        Summary
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => hasGoodreads ? window.open(data.goodreadsLink, '_blank') : window.open(`https://www.goodreads.com/search?q=${encodeURIComponent(title)}`, '_blank')}
                        className="border-slate-200 dark:border-slate-700"
                    >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Goodreads
                    </Button>
                </div>
            );

        default:
            return null;
    }
}
