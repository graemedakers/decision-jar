
import { z } from 'zod';
import {
    RecipeSchema,
    MovieSchema,
    BookSchema,
    ActivitySchema,
    DiningSchema,
    MusicSchema,
    GameSchema,
    EventSchema,
    TravelSchema,
    ItinerarySchema,
    IdeaTypeEnum
} from '@/lib/validation/idea-schemas';

// Base Interface for Shared Fields
export interface BaseIdeaTypeData {
    // metadata is now handled by the separate metadata JSON field in Prisma
}

// 1. Recipe
export type RecipeTypeData = z.infer<typeof RecipeSchema>;

// 2. Movie
export type MovieTypeData = z.infer<typeof MovieSchema>;

// 3. Book
export type BookTypeData = z.infer<typeof BookSchema>;

// 4. Activity
export type ActivityTypeData = z.infer<typeof ActivitySchema>;

// 5. Dining
export type DiningTypeData = z.infer<typeof DiningSchema>;

// 6. Music
export type MusicTypeData = z.infer<typeof MusicSchema>;

// 7. Game
export type GameTypeData = z.infer<typeof GameSchema>;

// 8. Event
export type EventTypeData = z.infer<typeof EventSchema>;

// 9. Travel
export type TravelTypeData = z.infer<typeof TravelSchema>;

// 10. Itinerary
export type ItineraryTypeData = z.infer<typeof ItinerarySchema>;

// Union Type
export type IdeaTypeData =
    | RecipeTypeData
    | MovieTypeData
    | BookTypeData
    | ActivityTypeData
    | DiningTypeData
    | MusicTypeData
    | GameTypeData
    | EventTypeData
    | TravelTypeData
    | ItineraryTypeData;

export type IdeaType = z.infer<typeof IdeaTypeEnum>;
