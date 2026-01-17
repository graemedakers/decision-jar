import { prisma } from "@/lib/prisma";
import { LEVEL_DEFINITIONS, ACHIEVEMENT_DEFINITIONS } from "./gamification-shared";
import { trackStreakMilestone, trackStreakLost, trackStreakContinued } from "./analytics";

/**
 * Updates the daily streak for a jar
 * Call this after any XP-earning action (add idea, spin jar, rate activity)
 */
export async function updateStreak(jarId: string) {
    if (!jarId) return null;

    try {
        const jar = await prisma.jar.findUnique({
            where: { id: jarId },
            select: { 
                lastActiveDate: true, 
                currentStreak: true, 
                longestStreak: true 
            }
        });

        if (!jar) return null;

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        let newStreak = 1;
        let streakContinued = false;
        let streakLost = false;
        let previousStreak = jar.currentStreak;

        if (jar.lastActiveDate) {
            const lastActive = new Date(jar.lastActiveDate);
            const lastActiveDay = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
            
            // Calculate days difference
            const daysDiff = Math.floor((today.getTime() - lastActiveDay.getTime()) / (1000 * 60 * 60 * 24));

            if (daysDiff === 0) {
                // Same day - no change to streak
                return {
                    currentStreak: jar.currentStreak,
                    longestStreak: jar.longestStreak,
                    streakContinued: false,
                    streakLost: false,
                    isNewRecord: false
                };
            } else if (daysDiff === 1) {
                // Yesterday - continue streak
                newStreak = jar.currentStreak + 1;
                streakContinued = true;
            } else {
                // Gap > 1 day - streak lost, reset to 1
                newStreak = 1;
                streakLost = daysDiff > 1;
            }
        }

        const newLongestStreak = Math.max(newStreak, jar.longestStreak);
        const isNewRecord = newLongestStreak > jar.longestStreak;

        const updatedJar = await prisma.jar.update({
            where: { id: jarId },
            data: {
                lastActiveDate: now,
                currentStreak: newStreak,
                longestStreak: newLongestStreak
            }
        });

        // Track analytics
        if (streakLost) {
            trackStreakLost(previousStreak, { jar_id: jarId, days_since_last_active: Math.floor((today.getTime() - new Date(jar.lastActiveDate!).getTime()) / (1000 * 60 * 60 * 24)) });
        } else if (streakContinued) {
            trackStreakContinued(newStreak, { jar_id: jarId });
            
            // Track milestones (7, 14, 30, 100 days)
            if ([7, 14, 30, 100].includes(newStreak)) {
                trackStreakMilestone(newStreak, isNewRecord, { jar_id: jarId, previous_longest: jar.longestStreak });
            }
        }

        return {
            currentStreak: updatedJar.currentStreak,
            longestStreak: updatedJar.longestStreak,
            streakContinued,
            streakLost,
            previousStreak,
            isNewRecord
        };
    } catch (error) {
        console.error("Error updating streak:", error);
        return null;
    }
}

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
