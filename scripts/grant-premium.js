
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'graemedakers@gmail.com';
    console.log(`Granting Lifetime Pro to: ${email}`);

    const user = await prisma.user.update({
        where: { email },
        data: {
            isLifetimePro: true
        }
    });

    console.log(`Success! User ${user.email} is now Lifetime Pro.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
