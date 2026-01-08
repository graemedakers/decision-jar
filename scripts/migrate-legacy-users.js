
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateLegacyUsers() {
    console.log("Starting legacy user migration...");

    const usersWithLegacy = await prisma.user.findMany({
        where: {
            legacyJarId: { not: null }
        },
        include: {
            memberships: true
        }
    });

    console.log(`Found ${usersWithLegacy.length} users to process.`);

    for (const user of usersWithLegacy) {
        console.log(`Processing user: ${user.email} (${user.id})`);

        // Fix 1: Ensure activeJarId is set
        if (!user.activeJarId) {
            console.log(`  - Fixing missing activeJarId... setting to ${user.legacyJarId}`);
            await prisma.user.update({
                where: { id: user.id },
                data: { activeJarId: user.legacyJarId }
            });
        }

        // Fix 2: Ensure JarMember exists
        const hasMembership = user.memberships.some(m => m.jarId === user.legacyJarId);
        if (!hasMembership) {
            console.log(`  - Creating missing JarMember record for jar ${user.legacyJarId}...`);
            await prisma.jarMember.create({
                data: {
                    userId: user.id,
                    jarId: user.legacyJarId,
                    role: 'ADMIN', // Legacy users were implicitly owners/admins
                    status: 'ACTIVE'
                }
            });
        } else {
            console.log(`  - Membership already exists.`);
        }
    }

    console.log("Migration complete.");
}

migrateLegacyUsers()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
