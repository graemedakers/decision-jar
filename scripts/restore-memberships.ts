// @ts-nocheck
/* eslint-disable */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("Restoring missing memberships...");

    // 1. Get the user
    const user = await prisma.user.findFirst({
        where: { email: 'graemedakers@gmail.com' },
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
                    role: 'ADMIN', // Legacy owners are usually admins
                    status: 'ACTIVE'
                }
            });
            console.log(" - Restored Legacy Jar membership.");
        }
    }

    // 3. Find ANY other jars where the user might be an admin/creator but membership was lost?
    // Or check if those jars still exist.
    // We can search for Jars where this user might be referenced in some other way? 
    // e.g. Created Ideas?

    // But if you were a member of a "Community Jar", your only link WAS the membership record.
    // If the membership record is gone, we can't easily find which jar you belonged to unless you created it (and we track creatorId on Jar?).
    // Schema check: Jar doesn't have `createdById`.

    // However, we deleted duplicate jars named "Decision Jar Feature Requests".
    // If you were a member of "Chores" or "letmebefree's Jar", and you didn't explicitly delete them, they should still exist.

    // Let's search for ALL Jars to see if those names exist, even if you aren't a member.
    const allJars = await prisma.jar.findMany({
        select: { id: true, name: true, _count: { select: { members: true } } }
    });

    console.log("\n--- All Existing Jars in DB ---");
    allJars.forEach(j => {
        console.log(`Jar: "${j.name}" (${j.id}) - Members: ${j._count.members}`);
    });

    // If we find "Chores" or others, we can manually re-add you.
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
