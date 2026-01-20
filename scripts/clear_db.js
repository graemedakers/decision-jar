const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// --- PRODUCTION SAFETY LOCK ---
const DATABASE_URL = process.env.DATABASE_URL || '';
const IS_PROD_URL = DATABASE_URL.includes('ep-weathered-sun') ||
    (DATABASE_URL.includes('pooler') && !DATABASE_URL.includes('cold-glade'));

if (IS_PROD_URL && process.env.PRODUCTION_LOCK !== 'OFF') {
    console.error('\n❌ PRODUCTION SAFETY LOCK ACTIVE');
    console.error('This script is attempting to CLEAR A PRODUCTION OR POOLED DATABASE.');
    console.error('Hostname:', DATABASE_URL.split('@')[1]?.split('/')[0] || 'Unknown');
    console.error('\nTo bypass this safety lock, set the environment variable:');
    console.error('  PRODUCTION_LOCK=OFF');
    console.error('\nOperation aborted for safety.\n');
    process.exit(1);
}
// ------------------------------

async function main() {
    try {
        // Delete in order to avoid foreign key constraints
        console.log('Deleting Ideas...')
        await prisma.idea.deleteMany({})

        console.log('Deleting Users...')
        await prisma.user.deleteMany({})

        console.log('Deleting Couples...')
        await prisma.couple.deleteMany({})

        console.log('Database cleared successfully!')
    } catch (error) {
        console.error('Error clearing database:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
