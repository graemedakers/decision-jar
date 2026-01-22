const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'postgresql://neondb_owner:npg_2wMQpZiD6WOa@ep-weathered-sun-a7gue54a-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
        },
    },
});

async function main() {
    try {
        const idea = await prisma.idea.findFirst({
            where: {
                description: {
                    contains: 'Affirmations During a workout',
                    mode: 'insensitive'
                }
            }
        });
        console.log(JSON.stringify(idea, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
