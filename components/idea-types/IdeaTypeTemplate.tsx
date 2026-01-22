import React from 'react';
import { getStandardizedData, suggestIdeaType } from '@/lib/idea-standardizer';
import { IdeaTypeRenderer } from './IdeaTypeRenderer';

interface IdeaTypeTemplateProps {
    idea: any;
    compact?: boolean;
}

/**
 * Smart wrapper that handles type inference/standardization
 * and delegates to the comprehensive IdeaTypeRenderer.
 */
export function IdeaTypeTemplate({ idea, compact = false }: IdeaTypeTemplateProps) {
    const effectiveType = idea.ideaType || suggestIdeaType(idea);
    const data = idea.typeData || getStandardizedData(idea);

    return (
        <IdeaTypeRenderer
            type={effectiveType || 'default'}
            data={data}
            idea={idea} // Pass full idea for generic fallback
            compact={compact}
        />
    );
}
