/**
 * Planner Configurations
 * 
 * This file contains the configuration objects for all AI-powered planners.
 * Each configuration drives a WizardFrame instance without custom component code.
 */

import { Calendar, ChefHat, Sparkles, Beer, MapPin, Users, Tent, PartyPopper } from 'lucide-react';
import { WizardConfig, WizardResultItem } from '@/lib/types/wizard';



// ============================================
// SURPRISE ME PLANNER
// ============================================

export const SURPRISE_ME_CONFIG: WizardConfig = {
    id: 'surprise-me',
    title: 'Surprise Me',
    subtitle: 'Generate a secret idea for your jar',
    icon: Sparkles,
    iconColor: 'text-orange-500',
    headerGradient: 'from-yellow-50 to-orange-50 dark:from-yellow-500/10 dark:to-orange-500/10',

    apiRoute: '/api/ideas/generate-surprise',

    fields: [
        {
            id: 'location',
            label: 'Location',
            type: 'location',
            defaultValue: '',
            placeholder: 'e.g. New York, NY',
        },
        {
            id: 'category',
            label: 'Category',
            type: 'button-group',
            defaultValue: 'ACTIVITY',
            options: [
                { value: 'ACTIVITY', label: 'Activity' },
                { value: 'DINING', label: 'Dining' },
                { value: 'ENTERTAINMENT', label: 'Entertainment' },
            ],
        },
        {
            id: 'cost',
            label: 'Cost',
            type: 'select',
            defaultValue: '$',
            options: [
                { value: 'FREE', label: 'Free' },
                { value: '$', label: '$ (Cheap)' },
                { value: '$$', label: '$$ (Moderate)' },
                { value: '$$$', label: '$$$ (Expensive)' },
            ],
        },
        {
            id: 'activityLevel',
            label: 'Energy',
            type: 'select',
            defaultValue: 'MEDIUM',
            options: [
                { value: 'LOW', label: 'Chill' },
                { value: 'MEDIUM', label: 'Moderate' },
                { value: 'HIGH', label: 'Active' },
            ],
        },
        {
            id: 'timeOfDay',
            label: 'Time of Day',
            type: 'button-group',
            defaultValue: 'ANY',
            options: [
                { value: 'ANY', label: 'Anytime' },
                { value: 'DAY', label: 'Day' },
                { value: 'EVENING', label: 'Evening' },
            ],
        },
        {
            id: 'isPrivate',
            label: 'Privacy',
            type: 'toggle',
            defaultValue: true,
            onLabel: 'Secret Mode On',
            offLabel: 'Public Mode',
            helpText: 'Secret ideas are hidden until spun.',
        },
    ],

    loadingTitle: 'Crafting a surprise...',
    loadingPhrases: [
        'Thinking of something fun...',
        'Checking the weather forecast...',
        'Scouting locations...',
        'Adding a dash of spontaneity...',
        'Wrapping your surprise...',
    ],
    estimatedSeconds: 8,

    resultLayout: 'list',
    resultTitle: () => 'Your Surprise is Ready!',

    parseResults: (apiResponse: any): WizardResultItem[] => {
        // Surprise Me typically returns a single idea
        if (apiResponse.idea) {
            return [{
                id: 'surprise-1',
                title: apiResponse.idea.description || 'Your Surprise',
                description: apiResponse.idea.details || '',
                metadata: {
                    cost: apiResponse.idea.cost,
                    category: apiResponse.idea.category,
                },
                raw: apiResponse.idea,
            }];
        }
        return [];
    },

    mapToIdea: (item, formData) => ({
        description: item.title,
        details: item.description,
        category: formData.category || 'ACTIVITY',
        cost: formData.cost,
        activityLevel: formData.activityLevel,
        isPrivate: formData.isPrivate,
    }),

    ideaCategory: 'ACTIVITY',
    allowRegenerate: false,
    allowFavorite: false,
    allowShare: false,
    showPrivacyToggle: true,
};

// ============================================
// BAR CRAWL PLANNER (Placeholder - Minimal Config)
// ============================================

export const BAR_CRAWL_CONFIG: WizardConfig = {
    id: 'bar-crawl',
    title: 'Bar Crawl Planner',
    subtitle: 'Plan the perfect night out',
    icon: Beer,
    iconColor: 'text-amber-500',
    headerGradient: 'from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10',

    apiRoute: '/api/planners/bar-crawl', // Placeholder

    fields: [
        {
            id: 'location',
            label: 'Neighborhood',
            type: 'location',
            defaultValue: '',
            placeholder: 'e.g. East Village, NYC',
        },
        {
            id: 'numStops',
            label: 'Number of Stops',
            type: 'number',
            defaultValue: 4,
            min: 2,
            max: 8,
        },
        {
            id: 'vibe',
            label: 'Vibe',
            type: 'button-group',
            defaultValue: 'Mixed',
            options: [
                { value: 'Dive', label: 'Dive Bars' },
                { value: 'Cocktail', label: 'Cocktail Lounges' },
                { value: 'Mixed', label: 'Mix It Up' },
                { value: 'Brewery', label: 'Breweries' },
            ],
        },
    ],

    loadingTitle: 'Mapping your night out...',
    loadingPhrases: [
        'Checking happy hours...',
        'Finding the best vibes...',
        'Plotting the route...',
        'Calling an Uber...',
    ],
    estimatedSeconds: 12,

    resultLayout: 'timeline',
    resultTitle: (count) => `Your ${count}-Stop Crawl`,

    parseResults: (apiResponse: any): WizardResultItem[] => {
        const stops = apiResponse.stops || [];
        return stops.map((stop: any, index: number) => ({
            id: `stop-${index}`,
            title: stop.name,
            subtitle: `Stop ${index + 1}`,
            description: stop.description,
            metadata: {
                address: stop.address,
                specialty: stop.specialty,
            },
            raw: stop,
        }));
    },

    mapToIdea: (item, formData) => ({
        description: item.title,
        details: item.description,
        address: item.metadata?.address,
        category: 'DRINK',
        isPrivate: false,
    }),

    ideaCategory: 'DRINK',
    allowRegenerate: true,
    allowFavorite: true,
    allowShare: true,
    showPrivacyToggle: false,
};

// ============================================
// REGISTRY
// ============================================

export const WIZARD_CONFIGS: Record<string, WizardConfig> = {

    'surprise-me': SURPRISE_ME_CONFIG,
    'bar-crawl': BAR_CRAWL_CONFIG,
};

export function getWizardConfig(id: string): WizardConfig | undefined {
    return WIZARD_CONFIGS[id];
}
