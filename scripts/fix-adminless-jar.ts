// @ts-nocheck
/* eslint-disable */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const jarId = '4d1b9314-1130-4b5d-804d-15378d8302cb';
    const email = 'graeme@letmebefree.com';

    console.log(`Fixing adminless jar ${jarId} for ${email}...`);

    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
        console.log("User not found");
        return;
    }

    // Check membership
    const member = await prisma.jarMember.findFirst({
        where: { jarId, userId: user.id }
    });

    if (member) {
        console.log(`Found existing membership. Status: ${member.status}, Role: ${member.role}`);

        console.log("Promoting to ADMIN/ACTIVE...");
        await prisma.jarMember.update({
            where: { id: member.id },
            data: {
                role: 'ADMIN',
                status: 'ACTIVE'
            }
        });
        console.log("Success.");
    } else {
        console.log("No membership found. Creating ADMIN membership...");
        await prisma.jarMember.create({
            data: {
                jarId,
                userId: user.id,
                role: 'ADMIN',
                status: 'ACTIVE'
            }
        });
        console.log("Success.");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
