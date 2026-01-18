export interface Idea {
    id: string;
    description: string;
    categoryId?: string;
    // Using string for category in frontend often, but maybe categoryId in DB. 
    // Allowing both for compatibility during refactor.
    category?: string;

    // Core fields
    createdAt?: string;
    updatedAt?: string;
    jarId?: string;
    createdById?: string;

    // Categorization
    indoor?: boolean;
    duration?: number | string; // Sometimes string in forms, number in DB
    activityLevel?: string;
    cost?: string;
    timeOfDay?: string;
    weather?: string;
    requiresTravel?: boolean;
    isPrivate?: boolean;

    // Metadata
    suggestedBy?: string;
    details?: string;

    // Concierge / Rich Details
    website?: string;
    address?: string;
    openingHours?: string;
    googleRating?: number;

    // Status
    selectedAt?: string | null;
    selectedDate?: string | null;
    isMasked?: boolean;

    // Frontend specific
    canEdit?: boolean;

    // Extensibility
    [key: string]: any;
}

export interface UserData {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;

    activeJarId: string | null;
    memberships: any[];

    // Preferences / Profile
    isPremium?: boolean;
    location?: string | null;
    homeTown?: string | null;
    interests?: string | null;

    // Jar context
    jarType?: 'ROMANTIC' | 'SOCIAL';
    jarName?: string;
    jarTopic?: string;
    jarSelectionMode?: 'RANDOM' | 'ADMIN_PICK' | 'VOTING' | 'ALLOCATION';
    isCreator?: boolean;

    // Partner/Social
    partnerName?: string;
    coupleCreatedAt?: string;
    coupleReferenceCode?: string;

    // Gamification
    xp?: number;
    level?: number;
    unlockedAchievements?: any[];
    hasPaid?: boolean;
    isTrialEligible?: boolean;

    // Legacy / Extensibility
    [key: string]: any;
}

export interface Jar {
    id: string;
    name: string;
    topic: string;
    type: 'ROMANTIC' | 'SOCIAL';
    selectionMode: 'RANDOM' | 'ADMIN_PICK' | 'VOTING' | 'ALLOCATION';
    ownerId: string;
    members?: any[];
    ideas?: Idea[];
}

// Re-export specific enums if needed or define them here too
export const JAR_TYPES = {
    ROMANTIC: 'ROMANTIC',
    SOCIAL: 'SOCIAL'
} as const;

export const SELECTION_MODES = {
    RANDOM: 'RANDOM',
    ADMIN_PICK: 'ADMIN_PICK',
    VOTING: 'VOTING',
    ALLOCATION: 'ALLOCATION'
} as const;

export type ActionResponse<T = void> =
    | (T extends void ? { success: true } : { success: true } & T)
    | { success: false; error: string; status?: number };
