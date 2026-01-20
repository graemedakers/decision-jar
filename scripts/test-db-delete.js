
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// --- PRODUCTION SAFETY LOCK ---
const DATABASE_URL = process.env.DATABASE_URL || '';
const IS_PROD_URL = DATABASE_URL.includes('ep-weathered-sun') ||
    (DATABASE_URL.includes('pooler') && !DATABASE_URL.includes('cold-glade'));

if (IS_PROD_URL && process.env.PRODUCTION_LOCK !== 'OFF') {
    console.error('\n❌ PRODUCTION SAFETY LOCK ACTIVE');
    console.error('This script is attempting to run WRITES/DELETES against a production or pooled database instance.');
    console.error('Hostname:', DATABASE_URL.split('@')[1]?.split('/')[0] || 'Unknown');
    console.error('\nTo bypass this safety lock, set the environment variable:');
    console.error('  PRODUCTION_LOCK=OFF');
    console.error('\nOperation aborted for safety.\n');
    process.exit(1);
}
// ------------------------------

async function main() {
    try {
        // 1. Create a dummy user and idea if needed, or just list existing
        const user = await prisma.user.findFirst({ include: { couple: true } });
        if (!user) {
            console.log("No user found");
            return;
        }

        console.log("User:", user.email);

        // 2. Create a dummy idea
        const idea = await prisma.idea.create({
            data: {
                description: "Test Delete Idea",
                coupleId: user.coupleId,
                createdById: user.id,
                indoor: true,
                duration: 1.0,
                activityLevel: "LOW",
                cost: "FREE",
                timeOfDay: "ANY"
            }
        });
        console.log("Created idea:", idea.id);

        // 3. Delete it via Prisma directly to verify DB connection
        await prisma.idea.delete({ where: { id: idea.id } });
        console.log("Deleted idea via Prisma");

        // We can't easily test the API route from a script without mocking the session/request
        // But we verified the DB operations work.

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
