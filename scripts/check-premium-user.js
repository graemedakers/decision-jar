
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'graemedakers@gmail.com';
    console.log(`Checking user: ${email}`);

    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            memberships: {
                include: {
                    jar: true
                }
            }
        }
    });

    if (!user) {
        console.log("User not found!");
        return;
    }

    console.log("User Data:");
    console.log(`ID: ${user.id}`);
    console.log(`isLifetimePro: ${user.isLifetimePro}`);
    console.log(`subscriptionStatus: ${user.subscriptionStatus}`);
    console.log(`stripeSubscriptionId: ${user.stripeSubscriptionId}`);

    console.log("\nMemberships:");
    user.memberships.forEach(m => {
        console.log(`- Jar: ${m.jar.name} (Code: ${m.jar.referenceCode}) [Role: ${m.role}]`);
    });

    const personalJars = user.memberships.filter(m => {
        const refCode = m.jar?.referenceCode;
        return refCode !== 'BUGRPT' && refCode !== 'FEATREQ';
    });

    console.log(`\nTotal Memberships: ${user.memberships.length}`);
    console.log(`Personal Jars (Counted for Limit): ${personalJars.length}`);

    const isPro = user.isLifetimePro || user.subscriptionStatus === 'active';
    console.log(`\nComputed isPro: ${isPro}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
