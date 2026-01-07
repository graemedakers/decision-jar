// check-user-columns.js
require('dotenv').config();
const { Client } = require('pg');

async function checkUserColumns() {
    const dbUrl = process.env.DATABASE_URL;
    const client = new Client({ connectionString: dbUrl });

    try {
        await client.connect();
        const res = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'User' 
            AND column_name IN ('coupleId', 'jarId', 'legacyJarId')
        `);
        console.log('User table columns:', res.rows.map(r => r.column_name));
    } finally {
        await client.end();
    }
}
checkUserColumns();
