import { prisma } from "@/lib/prisma";
import { ACHIEVEMENTS, AchievementDef } from "./achievements-shared";
import { trackAchievementUnlocked } from "./analytics";
import { notifyJarMembers } from "./notifications";

export async function checkAndUnlockAchievements(jarId: string): Promise<AchievementDef[]> {
    if (!jarId) return [];

    const newUnlocks: AchievementDef[] = [];

    try {
        // 1. Get counts
        const ideaCount = await prisma.idea.count({ where: { jarId } });
        // Selected dates (Spins) - checking ideas that have been selected
        // We filter out ideas that were selected immediately after creation (within 1 minute)
        // because those are usually "Direct Choices" from the Concierge, not "Spins".
        const selectionData = await prisma.idea.findMany({
            where: { jarId, selectedAt: { not: null } },
            select: { createdAt: true, selectedAt: true }
        });

        const spinCount = selectionData.filter(idea => {
            if (!idea.selectedAt) return false;
            // A "Spin" is when you select an idea that existed in the jar for a while.
            // If it was created and selected in the same flow, it's a "Direct Selection".
            // 60 seconds is a safe margin for any network lag vs a deliberate spin.
            const diffMs = Math.abs(idea.selectedAt.getTime() - idea.createdAt.getTime());
            return diffMs > 60000;
        }).length;
        // Rated dates (Completed) - we look at Ratings made by users in this jar
        const completedDatesCount = await prisma.idea.count({
            where: {
                jarId,
                ratings: { some: {} } // Has at least one rating
            }
        });

        // Get current streak
        const jar = await prisma.jar.findUnique({
            where: { id: jarId },
            select: { currentStreak: true }
        });
        const currentStreak = jar?.currentStreak || 0;

        // 2. Fetch already unlocked
        const existingUnlocks = await prisma.unlockedAchievement.findMany({
            where: { jarId },
            select: { achievementId: true }
        });
        const unlockedIds = new Set(existingUnlocks.map(u => u.achievementId));

        // 3. Check criteria
        for (const achievement of ACHIEVEMENTS) {
            if (unlockedIds.has(achievement.id)) continue;

            let unlocked = false;

            // Logic based on ID prefix is simple and robust for this scale
            if (achievement.id.startsWith('IDEA_') && ideaCount >= achievement.targetCount) unlocked = true;
            if (achievement.id.startsWith('SPIN_') && spinCount >= achievement.targetCount) unlocked = true;
            if (achievement.id.startsWith('RATE_') && completedDatesCount >= achievement.targetCount) unlocked = true;
            if (achievement.id.startsWith('STREAK_') && currentStreak >= achievement.targetCount) unlocked = true;

            if (unlocked) {
                await prisma.unlockedAchievement.create({
                    data: {
                        jarId,
                        achievementId: achievement.id
                    }
                });

                // Track analytics
                trackAchievementUnlocked(achievement.id, achievement.title, achievement.category, jarId);

                // Send push notification (non-blocking, respects user preferences)
                notifyJarMembers(jarId, null, {
                    title: '🏆 Achievement Unlocked!',
                    body: `${achievement.title} - ${achievement.description}`,
                    url: '/dashboard',
                    icon: '/icon-192.png',
                    tag: `achievement-${achievement.id}`,
                    requireInteraction: false
                }, 'notifyAchievements').catch(err => console.error("Achievement notification error:", err));

                newUnlocks.push(achievement);
            }
        }
    } catch (error) {
        console.error("Error checking achievements:", error);
    }

    return newUnlocks;
}
