// @ts-nocheck
/* eslint-disable */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const jarId = '4d1b9314-1130-4b5d-804d-15378d8302cb';
    console.log(`Checking status for jar ${jarId}...`);

    const jar = await prisma.jar.findUnique({
        where: { id: jarId }
    });

    if (!jar) {
        console.log('Jar not found');
        return;
    }

    console.log(`Name: ${jar.name}`);
    console.log(`isCommunityJar: ${jar.isCommunityJar}`);
    console.log(`subscriptionStatus: ${jar.subscriptionStatus}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
