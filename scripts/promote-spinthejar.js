const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const email = 'graeme@spinthejar.com';

    console.log(`Setting ${email} as super admin...`);

    const user = await prisma.user.update({
        where: { email },
        data: { isSuperAdmin: true }
    });

    console.log(`✅ ${user.email} is now a super admin (isSuperAdmin: ${user.isSuperAdmin})`);
}

main()
    .catch((e) => {
        console.error('Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
