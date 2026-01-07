// fix-both-databases.js
// Fix user premium status and run migration on BOTH dev and production databases

const { Client } = require('pg');

// PRODUCTION database
const PROD_DB = 'postgresql://neondb_owner:npg_2wMQpZiD6WOa@ep-weathered-sun-a7gue54a-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

// DEV database (from .env - check what it is)
const DEV_DB = 'postgresql://neondb_owner:EhCE25MEVHTZ@ep-cold-glade-a7ckfc7e.ap-southeast-2.aws.neon.tech/neondb?sslmode=require';

async function fixDatabase(dbUrl, dbName) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🔧 Fixing ${dbName} Database`);
    console.log('='.repeat(50));

    const client = new Client({ connectionString: dbUrl });

    try {
        await client.connect();
        console.log('✅ Connected\n');

        // 1. Check if migration is needed
        console.log('1️⃣ Checking table names...');
        const tableCheck = await client.query(`
            SELECT tablename FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename IN ('Couple', 'Jar')
        `);

        const tables = tableCheck.rows.map(r => r.tablename);
        console.log('   Found tables:', tables.join(', '));

        if (tables.includes('Couple') && !tables.includes('Jar')) {
            console.log('   ⚠️  Migration needed!');
            console.log('\n2️⃣ Running migration...');

            await client.query(`
                ALTER TABLE "Couple" RENAME TO "Jar";
                ALTER TABLE "UnlockedAchievement" RENAME COLUMN "coupleId" TO "jarId";
                ALTER TABLE "DeletedLog" RENAME COLUMN "coupleId" TO "jarId";
                ALTER TABLE "Idea" RENAME COLUMN "coupleId" TO "jarId";
                ALTER TABLE "FavoriteVenue" RENAME COLUMN "coupleId" TO "jarId";
                ALTER TABLE "VoteSession" RENAME COLUMN "coupleId" TO "jarId";
            `);

            console.log('   ✅ Migration complete!');
        } else if (tables.includes('Jar')) {
            console.log('   ✅ Already migrated!');
        }

        // 2. Fix user premium status
        console.log('\n3️⃣ Fixing user premium status...');
        const result = await client.query(`
            UPDATE "User"
            SET 
                "isLifetimePro" = true,
                "subscriptionStatus" = 'active'
            WHERE email = 'graemedakers@gmail.com'
            RETURNING email, "isLifetimePro", "subscriptionStatus"
        `);

        if (result.rows.length > 0) {
            console.log('   ✅ User updated:', result.rows[0]);
        } else {
            console.log('   ⚠️  User not found in this database');
        }

    } catch (error) {
        console.error(`   ❌ Error in ${dbName}:`, error.message);
    } finally {
        await client.end();
    }
}

async function main() {
    console.log('\n🚀 Fixing ALL databases...\n');

    await fixDatabase(DEV_DB, 'DEV');
    await fixDatabase(PROD_DB, 'PRODUCTION');

    console.log('\n' + '='.repeat(50));
    console.log('✅ ALL DONE!');
    console.log('='.repeat(50));
    console.log('\n📝 Next steps:');
    console.log('1. Restart your dev server (npm run dev)');
    console.log('2. Hard refresh browser (Ctrl+Shift+R)');
    console.log('3. Clear browser cookies for localhost:3000');
    console.log('4. Log out and log back in\n');
}

main();
