// migrate-dev-database.js
// Migrate the dev database using DATABASE_URL from .env

require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');

async function migrateDev() {
    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
        console.error('❌ DATABASE_URL not found in .env file');
        process.exit(1);
    }

    console.log('🔌 Connecting to dev database...');
    console.log(`   URL: ${dbUrl.replace(/:[^:@]+@/, ':****@')}\n`); // Hide password

    const client = new Client({
        connectionString: dbUrl,
    });

    try {
        await client.connect();
        console.log('✅ Connected!\n');

        // 1. Check current table names
        console.log('1️⃣ Checking table structure...');
        const tableCheck = await client.query(`
            SELECT tablename FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename IN ('Couple', 'Jar')
            ORDER BY tablename
        `);

        const tables = tableCheck.rows.map(r => r.tablename);
        console.log('   Tables found:', tables.join(', ') || 'none');

        if (tables.includes('Couple') && !tables.includes('Jar')) {
            console.log('   ⚠️  Migration needed!\n');

            // 2. Read and execute migration
            console.log('2️⃣ Running migration...');
            const sql = fs.readFileSync('rename_couple_to_jar_SAFE.sql', 'utf8');

            await client.query(sql);

            console.log('   ✅ Migration complete!\n');

            // 3. Verify
            console.log('3️⃣ Verifying changes...');
            const verifyCheck = await client.query(`
                SELECT tablename FROM pg_tables 
                WHERE schemaname = 'public' 
                AND tablename = 'Jar'
            `);

            if (verifyCheck.rows.length > 0) {
                console.log('   ✅ Jar table exists!');
            } else {
                console.log('   ❌ ERROR: Jar table not found after migration!');
            }

            // Check columns
            const columnCheck = await client.query(`
                SELECT column_name, table_name
                FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND column_name = 'jarId'
                AND table_name IN ('Idea', 'DeletedLog', 'FavoriteVenue', 'UnlockedAchievement', 'VoteSession')
                ORDER BY table_name
            `);

            console.log(`   ✅ Found ${columnCheck.rows.length} tables with jarId column:`);
            columnCheck.rows.forEach(row => {
                console.log(`      - ${row.table_name}.jarId`);
            });

        } else if (tables.includes('Jar')) {
            console.log('   ✅ Already migrated! No action needed.\n');
        } else {
            console.log('   ⚠️  Neither Couple nor Jar table found!');
            console.log('      This database might be empty or have a different schema.');
        }

        // 4. Fix user premium status
        console.log('\n4️⃣ Ensuring user premium status...');
        const userResult = await client.query(`
            UPDATE "User"
            SET 
                "isLifetimePro" = true,
                "subscriptionStatus" = 'active'
            WHERE email = 'graemedakers@gmail.com'
            RETURNING email, "isLifetimePro", "subscriptionStatus"
        `);

        if (userResult.rows.length > 0) {
            console.log('   ✅ User updated:', userResult.rows[0]);
        } else {
            console.log('   ⚠️  User not found in dev database');
        }

        console.log('\n' + '='.repeat(50));
        console.log('✅ DEV DATABASE MIGRATION COMPLETE!');
        console.log('='.repeat(50));
        console.log('\n📝 Next steps:');
        console.log('1. Restart your dev server (npm run dev)');
        console.log('2. Run: npx prisma generate');
        console.log('3. Refresh your browser\n');

    } catch (error) {
        console.error('\n❌ Migration failed!');
        console.error('Error:', error.message);
        console.error('\nFull error:', error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

migrateDev();
