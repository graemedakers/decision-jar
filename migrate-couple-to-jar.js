// migrate-couple-to-jar.js
// Run with: node migrate-couple-to-jar.js

const { Client } = require('pg');
const fs = require('fs');

const DATABASE_URL = 'postgresql://neondb_owner:npg_2wMQpZiD6WOa@ep-weathered-sun-a7gue54a-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function runMigration() {
    const client = new Client({
        connectionString: DATABASE_URL,
    });

    try {
        console.log('🔌 Connecting to database...');
        await client.connect();
        console.log('✅ Connected!');

        console.log('\n📊 Reading migration SQL...');
        const sql = fs.readFileSync('rename_couple_to_jar_SAFE.sql', 'utf8');

        console.log('\n🚀 Executing migration...');
        console.log('⚠️  This will rename Couple → Jar');

        const result = await client.query(sql);

        console.log('\n✅ Migration completed successfully!');
        console.log('📝 Details:', result);

        // Verify the changes
        console.log('\n🔍 Verifying table exists...');
        const verifyTable = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'Jar'
        `);

        if (verifyTable.rows.length > 0) {
            console.log('✅ Jar table exists!');
        } else {
            console.log('❌ WARNING: Jar table not found!');
        }

        console.log('\n🔍 Verifying column renames...');
        const verifyColumns = await client.query(`
            SELECT column_name, table_name
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND column_name = 'jarId'
            ORDER BY table_name
        `);

        console.log('✅ Tables with jarId column:');
        verifyColumns.rows.forEach(row => {
            console.log(`   - ${row.table_name}.jarId`);
        });

    } catch (error) {
        console.error('\n❌ Migration failed!');
        console.error('Error:', error.message);
        console.error('\nFull error:', error);
        process.exit(1);
    } finally {
        await client.end();
        console.log('\n🔌 Database connection closed.');
    }
}

runMigration();
