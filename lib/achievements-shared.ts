export interface AchievementDef {
    id: string;
    title: string;
    description: string;
    icon: string; // Lucide icon name
    category: 'CREATION' | 'ACTION' | 'COMPLETION' | 'STREAK';
    targetCount: number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
    { id: 'IDEA_1', title: 'Spark Starter', description: 'Add your first idea', icon: 'Lightbulb', category: 'CREATION', targetCount: 1 },
    { id: 'IDEA_10', title: 'The Architect', description: 'Add 10 ideas', icon: 'Hammer', category: 'CREATION', targetCount: 10 },
    { id: 'IDEA_25', title: 'Idea Machine', description: 'Add 25 ideas', icon: 'Warehouse', category: 'CREATION', targetCount: 25 },

    { id: 'SPIN_1', title: 'Jar Spinner', description: 'Spin the jar for the first time', icon: 'RotateCcw', category: 'ACTION', targetCount: 1 },
    { id: 'SPIN_10', title: 'Spin Veteran', description: 'Spin the jar 10 times', icon: 'RotateCcw', category: 'ACTION', targetCount: 10 },

    { id: 'RATE_1', title: 'Memory Maker', description: 'Complete and rate your first entry', icon: 'Heart', category: 'COMPLETION', targetCount: 1 },
    { id: 'RATE_5', title: 'Regular Resolver', description: 'Complete 5 entries', icon: 'Flame', category: 'COMPLETION', targetCount: 5 },
    { id: 'RATE_20', title: 'Decision Master', description: 'Complete 20 entries', icon: 'Crown', category: 'COMPLETION', targetCount: 20 },

    { id: 'STREAK_7', title: 'Week Warrior', description: 'Maintain a 7-day streak', icon: 'Flame', category: 'STREAK', targetCount: 7 },
    { id: 'STREAK_14', title: 'Fortnight Champion', description: 'Keep it up for 14 days', icon: 'Award', category: 'STREAK', targetCount: 14 },
    { id: 'STREAK_30', title: 'Monthly Master', description: 'Incredible 30-day streak!', icon: 'Trophy', category: 'STREAK', targetCount: 30 },
    { id: 'STREAK_100', title: 'Century Legend', description: 'Unstoppable 100-day streak', icon: 'Crown', category: 'STREAK', targetCount: 100 },
];
