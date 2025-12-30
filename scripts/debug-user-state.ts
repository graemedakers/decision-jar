// @ts-nocheck
/* eslint-disable */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const targetEmail = 'graeme@letmebefree.com';
    console.log(`Checking user memberships for ${targetEmail}...`);

    const user = await prisma.user.findFirst({
        where: { email: targetEmail },
        include: {
            memberships: {
                include: {
                    jar: true
                }
            }
        }
    })

    if (!user) {
        console.log('User not found')
        return
    }

    console.log(`User: ${user.email} (ID: ${user.id})`);
    console.log(`Explicit Memberships: ${user.memberships.length}`);

    user.memberships.forEach((m, idx) => {
        console.log(`[${idx + 1}] ID: ${m.jarId} | Name: "${m.jar.name}" | Role: ${m.role}`);
    });

    // Check legacy coupleId field
    if (user.coupleId) {
        console.log(`\nLEGACY coupleId found: ${user.coupleId}`);
        const legacyJar = await prisma.jar.findUnique({ where: { id: user.coupleId } });
        if (legacyJar) {
            console.log(`Legacy Jar Name: ${legacyJar.name}`);
        } else {
            console.log("Legacy jar ID does not exist in Jar table.");
        }
    } else {
        console.log("\nNo legacy coupleId set.");
    }

    // Also check activeJarId
    console.log(`Active Jar ID: ${user.activeJarId}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
