
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    const email = process.argv[2];

    if (!email) {
        console.error('Please provide an email address as an argument.');
        process.exit(1);
    }

    try {
        const user = await prisma.user.update({
            where: { email: email },
            data: {
                emailVerified: new Date(),
                // Also ensure they have a password hash if needed, or bypass other checks
            },
        });
        console.log(`Successfully verified email for user: ${user.email}`);
    } catch (error) {
        console.error('Error verifying user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
