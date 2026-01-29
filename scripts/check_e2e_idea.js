const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findFirst({
        where: { email: { startsWith: 'e2e_user_' } },
        orderBy: { createdAt: 'desc' },
        include: { memberships: { include: { jar: true } } }
    });

    if (!user) {
        console.log('User not found');
        return;
    }

    console.log(`Checking ideas for user: ${user.email}`);

    const jarId = user.activeJarId;
    if (!jarId) {
        console.log('User has no active jar');
        return;
    }

    const ideas = await prisma.idea.findMany({
        where: { jarId: jarId },
        orderBy: { createdAt: 'desc' }
    });

    console.log(`Found ${ideas.length} ideas in jar ${jarId}:`);
    console.log(JSON.stringify(ideas, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
