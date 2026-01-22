import { z } from 'zod';
import {
    IdeaTypeDataSchema,
    RecipeSchema,
    MovieSchema,
    BookSchema,
    ActivitySchema,
    DiningSchema,
    MusicSchema
} from '../validation/idea-schemas';
import { IdeaType } from '../types/idea-types';

/**
 * Safely parses data against a specific idea type schema.
 */
type SafeParseResult = { success: true; data: any } | { success: false; error: any };

export function validateIdeaData(type: string, data: any): SafeParseResult {
    switch (type) {
        case 'recipe': return RecipeSchema.safeParse(data);
        case 'movie': return MovieSchema.safeParse(data);
        case 'book': return BookSchema.safeParse(data);
        case 'activity': return ActivitySchema.safeParse(data);
        case 'dining': return DiningSchema.safeParse(data);
        case 'music': return MusicSchema.safeParse(data);
        default:
            return { success: false, error: new z.ZodError([{ code: 'custom', path: [], message: 'Invalid idea type' }]) };
    }
}

/**
 * Helper to ensure data matches the expected structure for a given type string.
 * wrapper for use in API routes before saving.
 */
export function parseIdeaDataStrict(type: IdeaType, data: any) {
    const result = validateIdeaData(type, data);
    if (!result.success) {
        throw new Error(`Invalid data for type ${type}: ${result.error.message}`);
    }
    return result.data;
}
