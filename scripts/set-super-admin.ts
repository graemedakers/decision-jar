import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Setting founder as super admin...');

    const founderEmail = 'graemedakers@gmail.com';

    const user = await prisma.user.update({
        where: { email: founderEmail },
        data: { isSuperAdmin: true }
    });

    console.log(`✅ ${user.email} is now a super admin`);
}

main()
    .catch((e) => {
        console.error('Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
