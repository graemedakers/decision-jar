const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Checking table existence...");
        // Use raw query to check if table exists. 
        // Postgres specific info schema check or just select
        const result = await prisma.$queryRaw`SELECT 1 FROM "GenerationHistory" LIMIT 1`;
        console.log("✅ Table GenerationHistory EXISTS.", result);
    } catch (e) {
        console.log("❌ Error querying GenerationHistory (likely does not exist):", e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
