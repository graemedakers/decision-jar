import { z } from "zod";

export const ideaSchema = z.object({
    description: z.string().min(1, "Description is required"),
    details: z.string().optional().nullable(),
    indoor: z.boolean().default(true),
    duration: z.union([z.number(), z.string()]).transform(val =>
        typeof val === 'string' ? parseFloat(val) : val
    ).default(0.5),
    activityLevel: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
    cost: z.string().default("$"),
    timeOfDay: z.enum(["DAY", "EVENING", "ANY"]).default("ANY"),
    category: z.string().default("ACTIVITY"),
    isPrivate: z.boolean().default(false),
    weather: z.enum(["ANY", "SUNNY", "RAINY", "COLD"]).default("ANY"),
    requiresTravel: z.boolean().default(false),
    photoUrls: z.array(z.string()).optional().default([]),
    ideaType: z.string().optional().nullable(),
    typeData: z.any().optional().nullable(),
    metadata: z.any().optional().nullable(),
    website: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    googleRating: z.number().optional().nullable(),
    openingHours: z.string().optional().nullable(),
    selectedAt: z.string().optional().nullable(),
    selectedDate: z.string().optional().nullable(),
    rating: z.number().optional().nullable(),
    notes: z.string().optional().nullable(),
});

export type IdeaInput = z.infer<typeof ideaSchema>;
