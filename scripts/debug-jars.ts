// @ts-nocheck
/* eslint-disable */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const user = await prisma.user.findFirst({
        where: { email: 'graemedakers@gmail.com' },
        include: {
            memberships: {
                include: {
                    jar: {
                        include: {
                            _count: {
                                select: { ideas: true, members: true }
                            }
                        }
                    }
                }
            }
        }
    })

    if (!user) {
        console.log('User not found')
        return
    }

    console.log(`User: ${user.email} (ID: ${user.id})`);
    console.log(`Active Jar: ${user.activeJarId}`);
    console.log('--- Jars ---');

    user.memberships.forEach((m) => {
        const j = m.jar;
        console.log(`ID: ${j.id}`);
        console.log(`Name: "${j.name}"`);
        console.log(`Role: ${m.role}`);
        console.log(`Ideas: ${j._count.ideas}, Users: ${j._count.users}`);
        console.log(`Created: ${j.createdAt}`);
        console.log('---');
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
