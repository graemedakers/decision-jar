// @ts-nocheck
/* eslint-disable */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("Searching for Duplicate Jars...");

    // 1. Find the duplicate jars by name pattern
    const duplicates = await prisma.jar.findMany({
        where: {
            name: {
                in: ['Decision Jar feature requests', 'Decision-Jar Feature Requests', 'Decision Jar Feature Requests']
            }
        },
        include: {
            _count: {
                select: { ideas: true, members: true }
            }
        }
    });

    console.log(`Found ${duplicates.length} potential duplicates.`);

    if (duplicates.length === 0) {
        console.log("No duplicates found to delete. (Check database connection?)");
        return;
    }

    // 2. Identify candidates for deletion (Empty ones or simply all but the 'best' one)
    // We will keep the one with the MOST ideas, or the OLDEST one if tied.

    // Sort by ideas desc, then created asc
    // The first one is the "primary" to keep.
    duplicates.sort((a, b) => {
        if (b._count.ideas !== a._count.ideas) return b._count.ideas - a._count.ideas; // More ideas first
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); // Older first
    });

    const [toKeep, ...toDelete] = duplicates;

    if (toDelete.length === 0) {
        console.log(`Only one instance found (${toKeep.id}). No action needed.`);
        return;
    }

    console.log(`\nKEEPING: "${toKeep.name}" (ID: ${toKeep.id}) - Ideas: ${toKeep._count.ideas}, Members: ${toKeep._count.members}`);
    console.log("DELETING duplicates:");

    for (const jar of toDelete) {
        console.log(` - Deleting: "${jar.name}" (ID: ${jar.id}) - Ideas: ${jar._count.ideas}`);

        // Delete related records first if cascade isn't set up (Prisma usually handles cascade if defined in schema, but being safe)
        // We will just try deleting the Jar. If schema has cascade delete, it works.
        try {
            // If cascading delete is not enabled in DB, we might need to delete memberships/ideas first.
            // Let's assume schema has Cascade. If not, we catch error.
            // Manually delete memberships first
            await prisma.jarMember.deleteMany({
                where: { jarId: jar.id }
            });
            // Then delete the Jar
            await prisma.jar.delete({
                where: { id: jar.id }
            });
            console.log(`   [SUCCESS] Deleted ${jar.id}`);
        } catch (e) {
            console.error(`   [FAILED] Could not delete ${jar.id}: ${e.message}`);
            // Fallback: Delete dependencies manually?
            // For now, just logging.
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
