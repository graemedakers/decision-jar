const { PrismaClient } = require('@prisma/client');
const DATABASE_URL = 'postgresql://neondb_owner:npg_2wMQpZiD6WOa@ep-cold-glade-a7ckfc7e-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const prisma = new PrismaClient({
    datasources: { db: { url: DATABASE_URL } }
});

async function main() {
    try {
        await prisma.$connect();
        const users = await prisma.user.findMany({
            where: {
                email: {
                    contains: 'graeme',
                    mode: 'insensitive'
                }
            },
            select: { email: true }
        });

        console.log(`Found ${users.length} users with 'graeme' in DEV email:`);
        users.forEach(u => console.log(`- ${u.email}`));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
