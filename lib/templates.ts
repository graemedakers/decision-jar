
export interface JarTemplate {
    id: string;
    label: string;
    description: string;
    icon: string; // Emoji
    theme: 'pink' | 'purple' | 'blue' | 'amber' | 'green';
    type: 'ROMANTIC' | 'SOCIAL' | 'FAMILY' | 'SOLO' | 'WORK';
    starterIdeas: {
        description: string;
        cost: string; // $, $$, $$$
        duration: number; // in hours
        tags: string[];
    }[];
}

export const ONBOARDING_TEMPLATES: JarTemplate[] = [
    {
        id: 'date_night',
        label: 'Date Night',
        description: 'Spark romance with fun date ideas, from cozy nights in to adventures out.',
        icon: '❤️',
        theme: 'pink',
        type: 'ROMANTIC',
        starterIdeas: [
            { description: "Cook a new recipe together", cost: "$$", duration: 2, tags: ["Indoor", "Food"] },
            { description: "Visit a local museum", cost: "$", duration: 3, tags: ["Outdoor", "Culture"] },
            { description: "Movie marathon with popcorn", cost: "$", duration: 4, tags: ["Indoor", "Relaxed"] }
        ]
    },
    {
        id: 'family_fun',
        label: 'Family Fun',
        description: 'Keep the kids entertained and build memories together.',
        icon: '👨‍👩‍👧‍👦',
        theme: 'amber',
        type: 'FAMILY',
        starterIdeas: [
            { description: "Built a blanket fort", cost: "Free", duration: 2, tags: ["Indoor", "Kids"] },
            { description: "Family game night", cost: "Free", duration: 1.5, tags: ["Indoor", "Fun"] },
            { description: "Pizza picnic in the park", cost: "$", duration: 2, tags: ["Outdoor", "Food"] }
        ]
    },
    {
        id: 'social_hangout',
        label: 'Friends Hangout',
        description: 'Decide where to go or what to do with your squad.',
        icon: '🎉',
        theme: 'purple',
        type: 'SOCIAL',
        starterIdeas: [
            { description: "Try a new cocktail bar", cost: "$$", duration: 2, tags: ["Nightlife", "Drinks"] },
            { description: "Escape Room", cost: "$$$", duration: 1.5, tags: ["Activity", "Group"] },
            { description: "Potluck Dinner", cost: "$", duration: 3, tags: ["Indoor", "Food"] }
        ]
    },
    {
        id: 'self_care',
        label: 'Self Care',
        description: 'Prioritize yourself with mindful activities and treats.',
        icon: '🧘',
        theme: 'green',
        type: 'SOLO',
        starterIdeas: [
            { description: "Read a book for 1 hour", cost: "Free", duration: 1, tags: ["Quiet", "Relax"] },
            { description: "Go for a long nature walk", cost: "Free", duration: 1.5, tags: ["Outdoor", "Active"] },
            { description: "Try a new coffee shop", cost: "$", duration: 1, tags: ["Treat", "Food"] }
        ]
    },
    {
        id: 'work_team',
        label: 'Team Building',
        description: 'Energize the team with quick activities and lunches.',
        icon: '🚀',
        theme: 'blue',
        type: 'WORK',
        starterIdeas: [
            { description: "Team Lunch", cost: "$$", duration: 1, tags: ["Food", "Social"] },
            { description: "Virtual Trivia", cost: "Free", duration: 0.5, tags: ["Remote", "Fun"] },
            { description: "Happy Hour", cost: "$", duration: 1, tags: ["Drinks", "Social"] }
        ]
    }
];
