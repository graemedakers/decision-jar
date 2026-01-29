const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findFirst({
        where: { email: { startsWith: 'e2e_user_' } },
        orderBy: { createdAt: 'desc' },
        include: { memberships: true }
    });

    console.log('Most recent E2E user:');
    console.log(JSON.stringify(user, null, 2));

    const allUsers = await prisma.user.count();
    console.log(`Total users: ${allUsers}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
