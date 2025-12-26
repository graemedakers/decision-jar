export interface AchievementDef {
    id: string;
    title: string;
    description: string;
    icon: string; // Lucide icon name
    category: 'CREATION' | 'ACTION' | 'COMPLETION';
    targetCount: number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
    { id: 'IDEA_1', title: 'Spark Starter', description: 'Add your first idea', icon: 'Lightbulb', category: 'CREATION', targetCount: 1 },
    { id: 'IDEA_10', title: 'The Architect', description: 'Add 10 ideas', icon: 'Hammer', category: 'CREATION', targetCount: 10 },
    { id: 'IDEA_25', title: 'Idea Machine', description: 'Add 25 ideas', icon: 'Warehouse', category: 'CREATION', targetCount: 25 },

    { id: 'SPIN_1', title: 'Roll the Dice', description: 'Spin the jar for the first time', icon: 'Dices', category: 'ACTION', targetCount: 1 },
    { id: 'SPIN_10', title: 'Fate Tempter', description: 'Spin the jar 10 times', icon: 'RefreshCw', category: 'ACTION', targetCount: 10 },

    { id: 'RATE_1', title: 'Memory Maker', description: 'Complete and rate your first entry', icon: 'Heart', category: 'COMPLETION', targetCount: 1 },
    { id: 'RATE_5', title: 'Consistent Cooker', description: 'Complete 5 entries', icon: 'Flame', category: 'COMPLETION', targetCount: 5 },
    { id: 'RATE_20', title: 'Collection King/Queen', description: 'Complete 20 entries', icon: 'Crown', category: 'COMPLETION', targetCount: 20 },
];
