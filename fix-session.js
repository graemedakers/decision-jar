// fix-session.js
// Clear user session to force fresh login

const { Client } = require('pg');

const DATABASE_URL = 'postgresql://neondb_owner:npg_2wMQpZiD6WOa@ep-weathered-sun-a7gue54a-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function fixSession() {
    const client = new Client({
        connectionString: DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('✅ Connected to database\n');

        const email = 'graemedakers@gmail.com';

        // Delete all sessions for this user
        console.log('🗑️  Clearing all sessions...');
        const result = await client.query(`
            DELETE FROM "Session"
            WHERE "userId" IN (
                SELECT id FROM "User" WHERE email = $1
            )
        `, [email]);

        console.log(`✅ Deleted ${result.rowCount} session(s)`);
        console.log('\n📝 Next steps:');
        console.log('1. Refresh the browser (Ctrl+Shift+R or Cmd+Shift+R)');
        console.log('2. Log out if still seeing issues');
        console.log('3. Log back in');
        console.log('4. Your jars and ideas should now appear!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

fixSession();
