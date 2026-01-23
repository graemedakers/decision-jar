
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = `debug-${Date.now()}@example.com`;
    console.log(`Attempting to create debug user with email: ${email}`);

    try {
        const user = await prisma.user.create({
            data: {
                email: email,
                name: 'Debug User',
                image: 'https://example.com/avatar.jpg',
                emailVerified: new Date(),
            },
        });

        console.log('✅ User created successfully:', user.id);

        // Cleanup
        await prisma.user.delete({
            where: { id: user.id },
        });
        console.log('✅ User deleted successfully');

    } catch (error) {
        console.error('❌ Failed to create user via Prisma:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
