
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const emails = [
        'graeme_dakers@hotmail.com',
        'graeme@letmebefree.com',
        'graeme@spinthejar.com'
    ];

    console.log(`Deleting users with emails: ${emails.join(', ')}`);

    const result = await prisma.user.deleteMany({
        where: {
            email: {
                in: emails,
                mode: 'insensitive' // Ensure case-insensitive matching
            }
        }
    });

    console.log(`Deleted ${result.count} users.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
