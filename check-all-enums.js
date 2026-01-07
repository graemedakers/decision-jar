// check-all-enums.js
require('dotenv').config();
const { Client } = require('pg');

async function checkAllEnums() {
    const dbUrl = process.env.DATABASE_URL;
    const client = new Client({ connectionString: dbUrl });

    try {
        await client.connect();

        const enums = ['MemberStatus', 'SelectionMode', 'JarType', 'IdeaStatus', 'TieBreakerMode', 'VoteStatus'];

        for (const enumName of enums) {
            console.log(`\nChecking ${enumName}...`);
            try {
                const res = await client.query(`SELECT unnest(enum_range(NULL::"${enumName}"))::text as value`);
                console.log(`   DB Values:`, res.rows.map(r => r.value));
            } catch (e) {
                console.log(`   Error: ${e.message} (enum might not exist)`);
            }
        }

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}
checkAllEnums();
