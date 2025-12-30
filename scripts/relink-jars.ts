// @ts-nocheck
/* eslint-disable */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("Re-linking orphaned jars...");

    const user = await prisma.user.findFirst({
        where: { email: 'graemedakers@gmail.com' },
    });

    if (!user) {
        console.log('User not found');
        return;
    }

    // IDs found in previous step
    const targetJars = [
        { id: '3f7c2277-c06a-40bc-bb1b-f49c579942eb', name: "letmebefree's Jar" },
        { id: 'b6b33a98-58f1-4827-8952-0a319adaaa5e', name: "Chores" },
        { id: '4d1b9314-1130-4b5d-804d-15378d8302cb', name: "Decision Jar feature requests" }
    ];

    for (const jar of targetJars) {
        // Check if membership already exists to avoid unique constraint error
        const existing = await prisma.jarMember.findFirst({
            where: { jarId: jar.id, userId: user.id }
        });

        if (!existing) {
            console.log(`Adding user to "${jar.name}"...`);
            await prisma.jarMember.create({
                data: {
                    userId: user.id,
                    jarId: jar.id,
                    role: 'ADMIN',
                    status: 'ACTIVE'
                }
            });
            console.log(" - Success");
        } else {
            console.log(`User already in "${jar.name}"`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
