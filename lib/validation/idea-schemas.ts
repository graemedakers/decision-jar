
import { z } from 'zod';

export const IdeaTypeEnum = z.enum([
    'recipe',
    'movie',
    'book',
    'activity',
    'dining',
    'music',
    'game',      // NEW
    'event',     // NEW
    'travel',    // NEW
    'itinerary', // NEW
    'simple'     // NEW
]);

export type IdeaType = z.infer<typeof IdeaTypeEnum>;

// --- Shared Sub-Schemas ---

const MoneySchema = z.object({
    amount: z.number(),
    currency: z.string().default('USD'),
});

const LocationSchema = z.object({
    name: z.string().optional(),
    address: z.string().optional(),
    coordinates: z.object({
        lat: z.number(),
        lng: z.number()
    }).optional(),
    mapLink: z.string().url().optional()
});

// --- Specific Type Schemas ---

// 1. Recipe
export const RecipeSchema = z.object({
    title: z.string().min(1), // Added for consistency
    ingredients: z.array(z.string()).min(1),
    instructions: z.string().min(10),
    prepTime: z.number().int().min(0).optional(), // minutes
    cookTime: z.number().int().min(0).optional(), // minutes
    servings: z.number().int().positive().optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    cuisineType: z.string().optional(),
    dietaryTags: z.array(z.string()).optional(),
    nutritionInfo: z.object({
        calories: z.number().optional(),
        protein: z.number().optional(),
        carbs: z.number().optional()
    }).optional(),
    sourceUrl: z.string().url().optional(),
    tips: z.array(z.string()).optional(), // e.g. prep advice
    course: z.string().optional() // e.g. "Main Course", "Dessert"
});

// 2. Movie
export const MovieSchema = z.object({
    title: z.string().min(1),
    year: z.number().int().min(1900).optional(),
    genre: z.array(z.string()).optional(),
    director: z.string().optional(),
    cast: z.array(z.string()).optional(),
    runtime: z.number().int().positive().optional(), // minutes
    watchMode: z.enum(['cinema', 'streaming', 'either']).optional(),
    streamingPlatform: z.array(z.string()).optional(), // Changed to array
    theaters: z.array(z.string()).optional(), // New: Multiple cinemas
    imdbLink: z.string().url().optional(),
    rottenTomatoesScore: z.number().min(0).max(100).optional(),
    plot: z.string().optional(),
    platform: z.string().optional()
});

// 3. Book
export const BookSchema = z.object({
    title: z.string().min(1),
    author: z.string().min(1),
    isbn: z.string().optional(),
    yearPublished: z.number().int().optional(),
    genre: z.array(z.string()).optional(),
    pageCount: z.number().int().positive().optional(),
    format: z.enum(['physical', 'ebook', 'audiobook', 'any']).optional(),
    goodreadsLink: z.string().url().optional(),
    plot: z.string().optional()
});

// 4. Activity (Generic outing, sport, etc.)
export const ActivitySchema = z.object({
    activityType: z.string(), // e.g. "hiking", "bowling"
    location: LocationSchema.optional(),
    duration: z.number().positive().optional(), // hours
    participants: z.object({
        min: z.number().int().positive().optional(),
        max: z.number().int().positive().optional()
    }).optional(),
    equipmentNeeded: z.array(z.string()).optional(),
    bookingRequired: z.boolean().default(false),
    bookingLink: z.string().url().optional(),
    officialWebsite: z.string().url().optional(),
    cost: MoneySchema.optional()
});

// 5. Dining (Restaurants, Bars, Cafes)
export const DiningSchema = z.object({
    establishmentName: z.string().min(1),
    cuisine: z.string().optional(), // e.g. "Italian", "Bar"
    location: LocationSchema.optional(),
    priceRange: z.enum(['$', '$$', '$$$', '$$$$']).optional(),
    rating: z.number().min(0).max(5).optional(), // Google/Yelp rating
    website: z.string().url().optional(),
    reservationRequired: z.boolean().default(false),
    menuHighlights: z.array(z.string()).optional(),
    dietaryOptions: z.array(z.string()).optional() // e.g. "vegan friendly"
});

// 6. Music (Concerts, Albums)
export const MusicSchema = z.object({
    artist: z.string().min(1),
    title: z.string().min(1), // Album or Event name
    type: z.enum(['album', 'concert', 'playlist']).default('album'),
    genre: z.array(z.string()).optional(),
    releaseYear: z.number().int().optional(),
    listenLink: z.string().url().optional(), // Spotify/Apple Music
    eventDate: z.string().datetime().optional(), // If concert
    venue: LocationSchema.optional()
});

// --- NEW SCHEMAS ---

// 7. Game (Video Games, Board Games)
export const GameSchema = z.object({
    title: z.string().min(1),
    gameType: z.enum(['video_game', 'board_game', 'card_game']),
    genre: z.array(z.string()).optional(),
    platform: z.array(z.string()).optional(), // PC, PS5, Tabletop
    minPlayers: z.number().int().positive().default(1),
    maxPlayers: z.number().int().positive().optional(),
    coop: z.boolean().default(false), // Is it cooperative?
    rating: z.string().optional(), // ESRB or BGG rating
    playUrl: z.string().url().optional(), // NEW: Mandatory for Online Games
    estimatedPlaytime: z.number().positive().optional() // minutes
});

// 8. Event (Theatre, Sports, Comedy)
export const EventSchema = z.object({
    eventName: z.string().min(1),
    eventType: z.enum(['theatre', 'sports', 'concert', 'comedy', 'festival', 'other']),
    venue: LocationSchema.optional(),
    date: z.string().datetime().optional(), // Specific date if known
    startTime: z.string().optional(), // "19:30"
    ticketUrl: z.string().url().optional(),
    officialWebsite: z.string().url().optional(),
    seatingInfo: z.string().optional(),
    lineup: z.array(z.string()).optional() // For festivals/sports
});

// 9. Travel (Hotels, Holidays, Staycations)
export const TravelSchema = z.object({
    title: z.string().optional(), // Added for consistency
    destination: LocationSchema,
    travelType: z.enum(['hotel', 'resort', 'camping', 'road_trip', 'flight']),
    checkIn: z.string().datetime().optional(),
    checkOut: z.string().datetime().optional(),
    amenities: z.array(z.string()).optional(),
    transportMode: z.string().optional(),
    bookingReference: z.string().optional(),
    accommodationName: z.string().optional()
});

// 10. Itinerary (Date Night, Bar Crawl)
export const ItineraryStepSchema = z.object({
    order: z.number().int(),
    day: z.number().int().optional(), // NEW: Support multi-day
    time: z.string().optional(), // "18:00"
    activity: z.string(), // "Dinner at Mario's"
    location: LocationSchema.optional(),
    notes: z.string().optional()
});

export const ItinerarySchema = z.object({
    title: z.string().min(1),
    steps: z.array(ItineraryStepSchema).min(1),
    totalDuration: z.string().optional(), // "4 hours"
    vibe: z.string().optional(),
    estimatedCost: z.enum(['$', '$$', '$$$', '$$$$']).optional()
});

// --- Union Schema ---

// 11. Simple (Text-only content)
export const SimpleSchema = z.object({
    text: z.string().min(1),         // The main content/quote/joke
    theme: z.string().optional(),    // e.g. "motivational", "dad joke"
    author: z.string().optional(),   // e.g. "Marcus Aurelius"
    backgroundColor: z.string().optional() // Hex code for customization
});

export const IdeaTypeDataSchema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('recipe'), data: RecipeSchema }),
    z.object({ type: z.literal('movie'), data: MovieSchema }),
    z.object({ type: z.literal('book'), data: BookSchema }),
    z.object({ type: z.literal('activity'), data: ActivitySchema }),
    z.object({ type: z.literal('dining'), data: DiningSchema }),
    z.object({ type: z.literal('music'), data: MusicSchema }),
    z.object({ type: z.literal('game'), data: GameSchema }),
    z.object({ type: z.literal('event'), data: EventSchema }),
    z.object({ type: z.literal('travel'), data: TravelSchema }),
    z.object({ type: z.literal('itinerary'), data: ItinerarySchema }),
    z.object({ type: z.literal('simple'), data: SimpleSchema }),
]);
