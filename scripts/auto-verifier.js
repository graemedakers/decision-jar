
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Starting auto-verifier...');
    const emailPattern = 'demo.video';

    // Run for 5 minutes then exit
    const startTime = Date.now();
    const duration = 5 * 60 * 1000;

    while (Date.now() - startTime < duration) {
        try {
            const users = await prisma.user.findMany({
                where: {
                    email: { contains: emailPattern },
                    emailVerified: null
                }
            });

            for (const user of users) {
                console.log(`Verifying user: ${user.email}`);
                await prisma.user.update({
                    where: { id: user.id },
                    data: { emailVerified: new Date() }
                });
                console.log(`Verified ${user.email}`);
            }
        } catch (error) {
            console.error('Error in poll loop:', error);
        }

        // Wait 1 second
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('Auto-verifier finished.');
    await prisma.$disconnect();
}

main();
