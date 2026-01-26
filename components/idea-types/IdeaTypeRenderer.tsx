import React from 'react';
import { IdeaTypeData } from '@/lib/types/idea-types';
import { GameDetails } from './GameDetails';
import { EventDetails } from './EventDetails';
import { TravelDetails } from './TravelDetails';
import { ItineraryDetails } from './ItineraryDetails';
import { RecipeDetails } from './RecipeDetails';
import { MovieDetails } from './MovieDetails';
import { BookDetails } from './BookDetails';
import { MusicDetails } from './MusicDetails';
import { DiningDetails } from './DiningDetails';
import { ActivityDetails } from './ActivityDetails';
import { YouTubeDetails } from './YouTubeDetails';
import { GenericDetails } from './GenericDetails';

interface IdeaTypeRendererProps {
    type: string;
    data: IdeaTypeData | any;
    compact?: boolean;
    idea?: any; // Passed for Generic fallback context
}

export function IdeaTypeRenderer({ type, data, compact = false, idea }: IdeaTypeRendererProps) {
    // If no data is present but we have an idea, use GenericDetails as fallback
    if (!data && idea) {
        return <GenericDetails idea={idea} compact={compact} />;
    }

    const normalizedType = type?.toLowerCase();

    switch (normalizedType) {
        case 'game':
            return <GameDetails data={data} compact={compact} idea={idea} />;
        case 'event':
            return <EventDetails data={data} compact={compact} idea={idea} />;
        case 'travel':
            return <TravelDetails data={data} compact={compact} idea={idea} />;
        case 'itinerary':
            return <ItineraryDetails data={data} compact={compact} idea={idea} />;
        case 'recipe':
            return <RecipeDetails data={data} compact={compact} idea={idea} />;
        case 'movie':
            return <MovieDetails data={data} compact={compact} idea={idea} />;
        case 'book':
            return <BookDetails data={data} compact={compact} idea={idea} />;
        case 'music':
            return <MusicDetails data={data} compact={compact} idea={idea} />;
        case 'dining':
            return <DiningDetails data={data} compact={compact} idea={idea} />;
        case 'activity':
            return <ActivityDetails data={data} compact={compact} idea={idea} />;
        case 'simple':
            return (
                <div className="text-center p-4">
                    <p className="font-serif text-lg italic">"{data.text}"</p>
                    {data.author && <p className="text-xs text-muted-foreground mt-2">— {data.author}</p>}
                </div>
            );
        case 'youtube':
            return <YouTubeDetails data={data} idea={idea} />;
        default:
            return <GenericDetails data={data} idea={idea} compact={compact} />;
    }
}
