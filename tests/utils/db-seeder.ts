import { createUser } from '../factories/userFactory';
import { createJar } from '../factories/jarFactory';
import { createManyIdeas } from '../factories/ideaFactory';
import { prisma } from '@/lib/prisma';

/**
 * Seeds a full test scenario:
 * 1. Creates a user.
 * 2. Creates a jar owned by that user.
 * 3. populates the jar with N ideas.
 */
export async function seedFullJar(itemCount: number = 5, userOverrides = {}, jarOverrides = {}) {
    const user = await createUser(userOverrides);
    const jar = await createJar({ ownerId: user.id, ...jarOverrides });

    const ideas = await createManyIdeas(itemCount, {
        jarId: jar.id,
        createdById: user.id
    });

    return {
        user,
        jar,
        ideas
    };
}

/**
 * Cleans up the database for test runs.
 * 🛑 WARNING: This deletes data. Only use in dedicated test databases.
 */
export async function cleanupDatabase() {
    if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_DB_CLEANUP) {
        throw new Error("Cleanup rejected: Refusing to wipe production database.");
    }

    // Delete in order to respect constraints
    await prisma.vote.deleteMany();
    await prisma.voteSession.deleteMany();
    await prisma.rating.deleteMany();
    await prisma.idea.deleteMany();
    await prisma.jarMember.deleteMany();
    await prisma.unlockedAchievement.deleteMany();
    await prisma.giftToken.deleteMany();
    await prisma.favoriteVenue.deleteMany();
    await prisma.jar.deleteMany();
    await prisma.user.deleteMany();
}
