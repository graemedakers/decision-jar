import { prisma } from "@/lib/prisma";
import { LEVEL_DEFINITIONS, ACHIEVEMENT_DEFINITIONS } from "./gamification-shared";

export async function awardXp(jarId: string, amount: number) {
    if (!jarId) return null;

    try {
        const jar = await prisma.jar.findUnique({
            where: { id: jarId },
            select: { xp: true, level: true }
        });

        if (!jar) return null;

        const newXp = jar.xp + amount;

        // Find the highest level matching current XP
        const matchingLevel = [...LEVEL_DEFINITIONS]
            .reverse()
            .find(l => newXp >= l.minXp);

        const nextLevel = matchingLevel ? matchingLevel.level : 1;

        // Only level UP, never down
        const finalLevel = Math.max(nextLevel, jar.level);
        const leveledUp = finalLevel > jar.level;

        const updatedJar = await prisma.jar.update({
            where: { id: jarId },
            data: {
                xp: newXp,
                level: finalLevel
            }
        });

        return {
            xpAdded: amount,
            newTotalXp: updatedJar.xp,
            newLevel: updatedJar.level,
            leveledUp,
            levelTitle: matchingLevel?.title || "Unknown"
        };
    } catch (error) {
        console.error("Error awarding XP:", error);
        return null;
    }
}

export async function unlockAchievement(jarId: string, achievementId: string) {
    if (!jarId || !ACHIEVEMENT_DEFINITIONS[achievementId]) return null;

    try {
        const existing = await prisma.unlockedAchievement.findUnique({
            where: {
                jarId_achievementId: {
                    jarId,
                    achievementId
                }
            }
        });

        if (existing) return null; // Already unlocked

        await prisma.unlockedAchievement.create({
            data: {
                jarId,
                achievementId
            }
        });

        // Award XP
        const xpAmount = ACHIEVEMENT_DEFINITIONS[achievementId].xp;
        const xpResult = await awardXp(jarId, xpAmount);

        return {
            unlocked: true,
            achievement: ACHIEVEMENT_DEFINITIONS[achievementId],
            xpResult
        };

    } catch (error) {
        console.error("Error unlocking achievement:", error);
        return null;
    }
}
