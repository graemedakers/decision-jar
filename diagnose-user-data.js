// diagnose-user-data.js
// Comprehensive diagnosis of user data after migration

const { Client } = require('pg');

const DATABASE_URL = 'postgresql://neondb_owner:npg_2wMQpZiD6WOa@ep-weathered-sun-a7gue54a-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function diagnose() {
    const client = new Client({
        connectionString: DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('✅ Connected to database\n');

        const email = 'graemedakers@gmail.com';

        // Check User
        console.log('1️⃣ CHECKING USER ACCOUNT');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        const userResult = await client.query(`
            SELECT id, email, name, "activeJarId", "coupleId", "isLifetimePro"
            FROM "User"
            WHERE email = $1
        `, [email]);

        if (userResult.rows.length === 0) {
            console.log('❌ User not found!');
            return;
        }

        const user = userResult.rows[0];
        console.log('User ID:', user.id);
        console.log('activeJarId:', user.activeJarId);
        console.log('coupleId (legacy):', user.coupleId);
        console.log('isLifetimePro:', user.isLifetimePro);
        console.log();

        // Check Jars
        console.log('2️⃣ CHECKING JARS');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        const jarsResult = await client.query(`
            SELECT id, name, type, "referenceCode", "createdAt"
            FROM "Jar"
            ORDER BY "createdAt" DESC
            LIMIT 10
        `);
        console.log(`Found ${jarsResult.rows.length} total jars in database`);
        if (jarsResult.rows.length > 0) {
            jarsResult.rows.forEach((jar, i) => {
                console.log(`  ${i + 1}. ${jar.name} (${jar.id}) - ${jar.type}`);
            });
        }
        console.log();

        // Check JarMembers for this user
        console.log('3️⃣ CHECKING JAR MEMBERSHIPS');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        const membershipsResult = await client.query(`
            SELECT jm.*, j.name as "jarName"
            FROM "JarMember" jm
            LEFT JOIN "Jar" j ON jm."jarId" = j.id
            WHERE jm."userId" = $1
        `, [user.id]);
        console.log(`Found ${membershipsResult.rows.length} memberships`);
        if (membershipsResult.rows.length > 0) {
            membershipsResult.rows.forEach((m, i) => {
                console.log(`  ${i + 1}. Jar: ${m.jarName} (${m.jarId}) - Role: ${m.role}, Status: ${m.status}`);
            });
        }
        console.log();

        // Check Ideas
        console.log('4️⃣ CHECKING IDEAS');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        const ideasResult = await client.query(`
            SELECT id, description, "jarId", "createdById", "selectedAt"
            FROM "Idea"
            WHERE "createdById" = $1
            ORDER BY "createdAt" DESC
            LIMIT 10
        `, [user.id]);
        console.log(`Found ${ideasResult.rows.length} ideas created by user`);
        if (ideasResult.rows.length > 0) {
            ideasResult.rows.forEach((idea, i) => {
                console.log(`  ${i + 1}. "${idea.description.substring(0, 50)}..." (jarId: ${idea.jarId})`);
            });
        }
        console.log();

        // Check if legacy coupleId exists as Jar
        if (user.coupleId) {
            console.log('5️⃣ CHECKING LEGACY COUPLE RELATIONSHIP');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            const legacyJarResult = await client.query(`
                SELECT id, name, type
                FROM "Jar"
                WHERE id = $1
            `, [user.coupleId]);

            if (legacyJarResult.rows.length > 0) {
                console.log('✅ Legacy jar found:', legacyJarResult.rows[0]);

                // Check if user has membership
                const hasMembership = membershipsResult.rows.some(m => m.jarId === user.coupleId);
                if (!hasMembership) {
                    console.log('⚠️  User has legacy coupleId but NO JarMember record!');
                    console.log('   This is the problem - need to create JarMember entry');
                }
            } else {
                console.log('❌ Legacy jar NOT found!');
            }
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    } finally {
        await client.end();
    }
}

diagnose();
