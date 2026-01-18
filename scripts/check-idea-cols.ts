/**
 * CHECK IDEA COLUMNS
 */

import { PrismaClient } from '@prisma/client';

const PRODUCTION_URL = 'postgresql://neondb_owner:npg_2wMQpZiD6WOa@ep-weathered-sun-a7gue54a-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: PRODUCTION_URL
        }
    }
});

async function main() {
    console.log('🔍 Checking PRODUCTION Idea table columns...');

    try {
        const columns = await prisma.$queryRaw<any[]>`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'Idea'
        `;

        console.log('Columns found:', columns.map(c => c.column_name).join(', '));
    } catch (e: any) {
        console.error('Error:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
