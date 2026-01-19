
import { PrismaClient } from '@prisma/client';

/**
 * Robustly deletes a user and all their associated data from the database.
 * This handles memberships, jars (if the user is the only admin), ideas, votes, etc.
 * 
 * @param prisma - Prisma/Transaction client
 * @param userId - ID of the user to delete
 */
export async function deleteUserCompletely(prisma: any, userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            memberships: {
                include: {
                    jar: true
                }
            },
            rateLimit: true
        }
    });

    if (!user) {
        throw new Error(`User with ID ${userId} not found`);
    }

    // 1. Delete all ideas created by this user
    await prisma.idea.deleteMany({
        where: { createdById: user.id }
    });

    // 2. Delete all ratings by this user
    await prisma.rating.deleteMany({
        where: { userId: user.id }
    });

    // 3. Delete all votes by this user
    await prisma.vote.deleteMany({
        where: { userId: user.id }
    });

    // 4. Delete all favorites by this user
    await prisma.favoriteVenue.deleteMany({
        where: { userId: user.id }
    });

    // 5. Delete all app reviews by this user
    await prisma.appReview.deleteMany({
        where: { userId: user.id }
    });

    // 6. Delete all analytics events by this user
    await prisma.analyticsEvent.deleteMany({
        where: { userId: user.id }
    });

    // 7. Delete all push subscriptions
    await prisma.pushSubscription.deleteMany({
        where: { userId: user.id }
    });

    // 8. Delete rate limit records
    if (user.rateLimit) {
        await prisma.rateLimit.delete({
            where: { userId: user.id }
        });
    }

    // 9. Handle jars - delete if user is the only admin, otherwise just remove membership
    for (const membership of user.memberships) {
        const jar = membership.jar;
        const adminCount = await prisma.jarMember.count({
            where: {
                jarId: jar.id,
                role: { in: ['ADMIN', 'OWNER'] }
            }
        });

        if (adminCount === 1 && (membership.role === 'ADMIN' || membership.role === 'OWNER')) {
            // User is the only admin, delete the entire jar

            // Delete unlocked achievements (foreign key)
            await prisma.unlockedAchievement.deleteMany({
                where: { jarId: jar.id }
            });

            // Delete deleted logs (foreign key)
            await prisma.deletedLog.deleteMany({
                where: { jarId: jar.id }
            });

            // Delete all jar members
            await prisma.jarMember.deleteMany({
                where: { jarId: jar.id }
            });

            // Delete the jar (cascade handles the rest)
            await prisma.jar.delete({
                where: { id: jar.id }
            });
        } else {
            // Just remove the membership
            await prisma.jarMember.delete({
                where: { id: membership.id }
            });
        }
    }

    // 10. Delete OAuth accounts
    await prisma.account.deleteMany({
        where: { userId: user.id }
    });

    // 11. Delete sessions
    await prisma.session.deleteMany({
        where: { userId: user.id }
    });

    // 12. Finally, delete the user
    await prisma.user.delete({
        where: { id: user.id }
    });
}
