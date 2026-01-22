import React from 'react';
import { RecipeForm } from '@/components/idea-forms/RecipeForm';
import { MovieForm } from '@/components/idea-forms/MovieForm';
import { BookForm } from '@/components/idea-forms/BookForm';
import { EventForm } from '@/components/idea-forms/EventForm';
import { TravelForm } from '@/components/idea-forms/TravelForm';
import { GameForm } from '@/components/idea-forms/GameForm';
import { DiningForm } from '@/components/idea-forms/DiningForm';
import { MusicForm } from '@/components/idea-forms/MusicForm';
import { ActivityForm } from '@/components/idea-forms/ActivityForm';
import { SimpleForm } from '@/components/idea-forms/SimpleForm';

interface IdeaFormRendererProps {
    ideaType: string;
    typeData: any;
    onChange: (data: any) => void;
}

export function IdeaFormRenderer({ ideaType, typeData, onChange }: IdeaFormRendererProps) {
    const normalizedType = ideaType?.toLowerCase();
    switch (normalizedType) {
        case 'recipe':
            return <RecipeForm initialData={typeData} onChange={onChange} />;
        case 'movie':
            return <MovieForm initialData={typeData} onChange={onChange} />;
        case 'book':
            return <BookForm initialData={typeData} onChange={onChange} />;
        case 'event':
            return <EventForm initialData={typeData} onChange={onChange} />;
        case 'travel':
            return <TravelForm initialData={typeData} onChange={onChange} />;
        case 'game':
            return <GameForm initialData={typeData} onChange={onChange} />;
        case 'dining':
            return <DiningForm initialData={typeData} onChange={onChange} />;
        case 'music':
            return <MusicForm initialData={typeData} onChange={onChange} />;
        case 'activity':
            return <ActivityForm initialData={typeData} onChange={onChange} />;
        case 'simple':
            return <SimpleForm initialData={typeData} onChange={onChange} />;
        case 'itinerary':
            return <div className="p-4 bg-slate-100 dark:bg-white/10 rounded text-center text-sm text-slate-500">Manual Itinerary Entry Coming Soon. Use the AI Wizard for now.</div>;
        default:
            return null;
    }
}

