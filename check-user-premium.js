// check-user-premium.js
// Check and fix user premium status

const { Client } = require('pg');

const DATABASE_URL = 'postgresql://neondb_owner:npg_2wMQpZiD6WOa@ep-weathered-sun-a7gue54a-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function checkUser() {
    const client = new Client({
        connectionString: DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('✅ Connected to database\n');

        // Find your user
        const userQuery = await client.query(`
            SELECT 
                id, 
                email, 
                name,
                "isLifetimePro",
                "hasUsedTrial",
                "subscriptionStatus",
                "stripeCustomerId",
                "stripeSubscriptionId",
                "subscriptionEndsAt",
                "createdAt"
            FROM "User"
            WHERE email = 'graemedakers@gmail.com'
        `);

        if (userQuery.rows.length === 0) {
            console.log('❌ User not found!');
            return;
        }

        const user = userQuery.rows[0];
        console.log('📊 Current User Status:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Email: ${user.email}`);
        console.log(`Name: ${user.name}`);
        console.log(`isLifetimePro: ${user.isLifetimePro}`);
        console.log(`hasUsedTrial: ${user.hasUsedTrial}`);
        console.log(`subscriptionStatus: ${user.subscriptionStatus}`);
        console.log(`stripeCustomerId: ${user.stripeCustomerId}`);
        console.log(`stripeSubscriptionId: ${user.stripeSubscriptionId}`);
        console.log(`subscriptionEndsAt: ${user.subscriptionEndsAt}`);
        console.log(`createdAt: ${user.createdAt}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Fix: Grant lifetime premium
        console.log('🔧 Granting lifetime premium access...');
        const updateResult = await client.query(`
            UPDATE "User"
            SET 
                "isLifetimePro" = true,
                "hasUsedTrial" = false,
                "subscriptionStatus" = 'active'
            WHERE email = 'graemedakers@gmail.com'
            RETURNING id, email, "isLifetimePro"
        `);

        console.log('✅ User updated!');
        console.log('New status:', updateResult.rows[0]);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

checkUser();
