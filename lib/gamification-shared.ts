export const LEVEL_DEFINITIONS = [
    { level: 1, minXp: 0, title: "Newbie Decider" },
    { level: 2, minXp: 100, title: "Curious Picker" },
    { level: 3, minXp: 300, title: "Choice Explorer" },
    { level: 4, minXp: 600, title: "Activity Planning Pro" },
    { level: 5, minXp: 1000, title: "Decision Maker" },
    { level: 6, minXp: 1500, title: "Master of Choices" },
    { level: 7, minXp: 2200, title: "Executive Planner" },
    { level: 8, minXp: 3000, title: "Legendary Decider" },
    { level: 9, minXp: 4000, title: "Decision Guru" },
    { level: 10, minXp: 5500, title: "Universe Mind" },
];

export const ACHIEVEMENT_DEFINITIONS: Record<string, { title: string, description: string, xp: number }> = {
    "FIRST_IDEA": { title: "Idea Generator", description: "Added your first idea to the jar.", xp: 50 },
    "FIRST_SPIN": { title: "First Spin", description: "Spun the jar for the first time.", xp: 50 },
    "FIRST_DATE": { title: "Making Memories", description: "Completed your first date/activity.", xp: 100 },
    "HIGH_ROLLER": { title: "High Roller", description: "Rolled a 6 on the quick dice.", xp: 50 },
    "QUICK_DECIDER": { title: "Quick Decider", description: "Used a quick decision tool.", xp: 30 },
};

export function getNextLevelProgress(currentXp: number, currentLevel: number) {
    const currentLevelDef = LEVEL_DEFINITIONS.find(l => l.level === currentLevel);
    const nextLevelDef = LEVEL_DEFINITIONS.find(l => l.level === currentLevel + 1);

    if (!nextLevelDef) {
        // Max level reached
        return {
            progressPercent: 100,
            xpToNext: 0,
            nextTitle: "Max Level Reached",
            currentTitle: currentLevelDef?.title || "Max Level",
            nextLevelXp: currentXp
        };
    }

    const xpRequiredForNext = nextLevelDef.minXp;

    // Safety check if level def is missing
    const baseLevelXp = currentLevelDef ? currentLevelDef.minXp : 0;

    const xpIntoLevel = currentXp - baseLevelXp;
    const range = xpRequiredForNext - baseLevelXp;

    const progressPercent = Math.min(100, Math.max(0, (xpIntoLevel / range) * 100));

    return {
        progressPercent,
        xpToNext: xpRequiredForNext - currentXp,
        nextTitle: nextLevelDef.title,
        currentTitle: currentLevelDef?.title || "Unknown",
        nextLevelXp: xpRequiredForNext
    };
}
