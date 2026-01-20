/**
 * Safe Prisma Wrapper
 * 
 * This script prevents Prisma commands from running against production databases
 * unless explicitly authorized.
 * 
 * Usage:
 *   node scripts/safe-prisma.js db push
 *   node scripts/safe-prisma.js migrate dev
 */

const { spawnSync } = require('child_process');

async function main() {
    const args = process.argv.slice(2);
    const command = args.join(' ');

    // 1. Get the DATABASE_URL that Prisma will actually see
    // (This priorities any shell variable already set)
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
        console.error('❌ ERROR: DATABASE_URL is not set in your environment.');
        process.exit(1);
    }

    // 2. Define your production patterns
    const PROD_HOST = 'ep-weathered-sun';
    const isProd = databaseUrl.includes(PROD_HOST) ||
        (databaseUrl.includes('pooler') && !databaseUrl.includes('cold-glade'));

    // 3. The Safety Lock
    if (isProd && process.env.I_REALLY_WANT_TO_UPDATE_PROD !== 'YES') {
        console.error('\n🛑 CRITICAL SAFETY BLOCK');
        console.error('------------------------');
        console.error('You are attempting to run a Prisma command against PRODUCTION:');
        console.error(`Hostname: ${databaseUrl.split('@')[1]?.split('/')[0] || 'Unknown'}`);
        console.error(`Command: npx prisma ${command}`);
        console.error('\nIf you intended to update DEVELOPMENT, your shell environment is poisoned.');
        console.error('Run: $env:DATABASE_URL = "" (PowerShell) or unset DATABASE_URL (Bash)');
        console.error('\nIf you actually meant to update PRODUCTION, run:');
        console.error('  $env:I_REALLY_WANT_TO_UPDATE_PROD="YES"; npm run db:push (or equivalent)');
        console.error('------------------------\n');
        process.exit(1);
    }

    // 4. Execute the actual Prisma command
    console.log(`🚀 Running: npx prisma ${command}...`);
    const result = spawnSync('npx', ['prisma', ...args], {
        stdio: 'inherit',
        shell: true,
        env: process.env
    });

    process.exit(result.status);
}

main();
