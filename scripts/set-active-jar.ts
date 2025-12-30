// @ts-nocheck
/* eslint-disable */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const email = 'graemedakers@gmail.com';
    console.log(`Setting activeJarId for ${email}...`);

    const user = await prisma.user.findFirst({
        where: { email },
        include: { memberships: true }
    });

    if (!user) {
        console.log('User not found');
        return;
    }

    // Find "Bars for next Sat" or failing that, the first one.
    // Legacy ID was: 7ce8b38a-e7ee-4c1a-8b72-9c9254732900
    let targetJarId = '7ce8b38a-e7ee-4c1a-8b72-9c9254732900';

    // Verify user is a member of this jar
    const isMember = user.memberships.find(m => m.jarId === targetJarId);

    if (!isMember) {
        if (user.memberships.length > 0) {
            console.log("User not member of preferred target. Using first available membership.");
            targetJarId = user.memberships[0].jarId;
        } else {
            console.log("User has NO memberships. Cannot set activeJarId.");
            return;
        }
    }

    console.log(`Updating activeJarId to: ${targetJarId}`);

    await prisma.user.update({
        where: { id: user.id },
        data: { activeJarId: targetJarId }
    });

    console.log("Success.");
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
