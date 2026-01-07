// check-enums.js
require('dotenv').config();
const { Client } = require('pg');

async function checkEnums() {
    const dbUrl = process.env.DATABASE_URL;
    const client = new Client({ connectionString: dbUrl });

    try {
        await client.connect();

        console.log('Checking MemberStatus enum...');
        const res = await client.query(`
            SELECT unnest(enum_range(NULL::"MemberStatus"))::text as value
        `);
        console.log('Values:', res.rows.map(r => r.value));

        console.log('\nChecking JarMember table data...');
        const members = await client.query(`
            SELECT DISTINCT status FROM "JarMember"
        `);
        console.log('Distinct statuses in table:', members.rows.map(r => r.status));

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}
checkEnums();
