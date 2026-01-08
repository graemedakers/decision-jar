
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyUsers() {
    try {
        console.log("Verifying user state...");
        const users = await prisma.user.findMany({
            include: { memberships: true }
        });

        console.log(`Found ${users.length} users.`);

        let issues = 0;
        for (const user of users) {
            if (!user.activeJarId) {
                console.log(`User ${user.email} (${user.id}) has NO activeJarId.`);
                if (user.memberships.length > 0) {
                    console.log(`  - Has ${user.memberships.length} memberships. Could default to ${user.memberships[0].jarId}.`);
                } else {
                    console.log(`  - Has NO memberships. Orphaned user?`);
                }
                issues++;
            } else {
                // Verify activeJarId is in memberships (consistency check)
                const membership = user.memberships.find(m => m.jarId === user.activeJarId);
                if (!membership) {
                    console.log(`User ${user.email} has activeJarId ${user.activeJarId} but is NOT a member of it.`);
                    issues++;
                }
            }
        }

        if (issues === 0) {
            console.log("All users valid and consistent.");
        } else {
            console.log(`Found ${issues} potential issues.`);
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

verifyUsers();
