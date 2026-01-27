
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Fetching last 5 ideas...");
    const ideas = await prisma.idea.findMany({
        take: 5,
        orderBy: {
            createdAt: 'desc'
        },
        select: {
            id: true,
            description: true,
            category: true,
            ideaType: true,
            indoor: true,
            website: true,
            address: true,
            createdAt: true
        }
    });

    console.log(JSON.stringify(ideas, null, 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
