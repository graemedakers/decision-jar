// @ts-nocheck
/* eslint-disable */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const email = 'graeme@letmebefree.com';
    console.log(`Restoring memberships for ${email}...`);

    // 1. Get the user
    const user = await prisma.user.findFirst({
        where: { email },
        include: { memberships: true }
    });

    if (!user) {
        console.log('User not found');
        return;
    }

    // 2. Restore Legacy Jar Membership
    if (user.coupleId) {
        const existingLegacyMember = user.memberships.find(m => m.jarId === user.coupleId);

        if (!existingLegacyMember) {
            console.log(`Restoring membership for Legacy Jar ID: ${user.coupleId}`);
            await prisma.jarMember.create({
                data: {
                    userId: user.id,
                    jarId: user.coupleId,
                    role: 'ADMIN',
                    status: 'ACTIVE'
                }
            });
            console.log(" - Restored Legacy Jar membership.");
        } else {
            console.log("Legacy membership already exists.");
        }

        // 3. Fix Active Jar ID if it's pointing to something invalid
        // We detected it was pointing to someone else's jar.
        // Let's force set it to their legacy jar.
        if (user.activeJarId !== user.coupleId) {
            console.log(`Fixing activeJarId (was ${user.activeJarId})... setting to ${user.coupleId}`);
            await prisma.user.update({
                where: { id: user.id },
                data: { activeJarId: user.coupleId }
            });
            console.log(" - Fixed activeJarId.");
        }
    } else {
        console.log("No legacy jar linked.");
    }

    // 4. Check for orphaned jars like "Chores" that they might have owned?
    // We can search for jars named "Chores" and add them if they are empty?
    // But let's start with restoring the main one.
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
