
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLegacyUsage() {
    console.log("Checking for users relying on legacyJarId (coupleId)...");

    const usersWithLegacy = await prisma.user.findMany({
        where: {
            legacyJarId: { not: null }
        },
        include: {
            memberships: true
        }
    });

    console.log(`Found ${usersWithLegacy.length} users with a legacyJarId.`);

    let usersNeedActiveJarFix = 0;
    let usersNeedMembershipFix = 0;
    let safeToDrop = true;

    for (const user of usersWithLegacy) {
        let issues = [];

        // Check 1: Active Jar ID
        if (!user.activeJarId) {
            usersNeedActiveJarFix++;
            issues.push("Missing activeJarId");
        }

        // Check 2: Membership
        const hasMembershipForLegacy = user.memberships.some(m => m.jarId === user.legacyJarId);
        if (!hasMembershipForLegacy) {
            usersNeedMembershipFix++;
            issues.push("Missing JarMember record");
        }

        if (issues.length > 0) {
            console.log(`User ${user.email} (${user.id}) needs migration: ${issues.join(', ')}`);
            safeToDrop = false;
        }
    }

    console.log("\nSummary:");
    console.log(`Total Legacy Users: ${usersWithLegacy.length}`);
    console.log(`Users needing activeJarId fix: ${usersNeedActiveJarFix}`);
    console.log(`Users needing Membership fix: ${usersNeedMembershipFix}`);
    console.log(`Safe to drop column? ${safeToDrop ? "YES" : "NO"}`);
}

checkLegacyUsage()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
