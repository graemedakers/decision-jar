
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const adapter = PrismaAdapter(prisma);

async function main() {
    const email = `adapter-debug-${Date.now()}@example.com`;
    console.log(`Attempting to create user via Adapter with email: ${email}`);

    try {
        // The adapter's createUser method expects an object with email, emailVerified, etc.
        // It might return a Promise<AdapterUser>
        // Note: The types for adapter might require casting if strict
        const user = await adapter.createUser!({
            id: crypto.randomUUID(),
            email: email,
            name: "Adapter Debug User",
            emailVerified: new Date(),
            image: "https://example.com/avatar.png"
        });

        console.log('✅ Adapter created user successfully:', user);

        // Cleanup
        await prisma.user.delete({
            where: { email: email },
        });
        console.log('✅ User deleted successfully');

    } catch (error) {
        console.error('❌ Failed to create user via Adapter:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
