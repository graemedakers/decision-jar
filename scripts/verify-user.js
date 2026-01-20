const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'graemedakers@gmail.com';

    console.log(`🔍 Seeking user: ${email}`);

    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        console.error('❌ User not found');
        return;
    }

    console.log(`Found user: ${user.id}`);
    console.log(`Current Status: ${user.emailVerified ? 'Verified' : 'Unverified'}`);

    if (user.emailVerified) {
        console.log('✅ User is already verified.');
        return;
    }

    await prisma.user.update({
        where: { id: user.id },
        data: {
            emailVerified: new Date(),
            verificationToken: null // Clear token if any
        }
    });

    console.log(`✅ Successfully verified ${email}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
