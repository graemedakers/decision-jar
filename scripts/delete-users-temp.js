
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    const emails = [
        'graeme_dakers@hotmail.com',
        'graeme@letmebefree.com',
        'graeme@spinthejar.com'
    ];

    console.log(`Looking for users: ${emails.join(', ')}`);

    const users = await prisma.user.findMany({
        where: {
            email: {
                in: emails,
                mode: 'insensitive'
            }
        },
        select: { id: true, email: true }
    });

    if (users.length === 0) {
        console.log('No users found.');
        return;
    }

    const userIds = users.map(u => u.id);
    console.log(`Found ${users.length} users. IDs: ${userIds.join(', ')}`);

    await prisma.$transaction(async (tx) => {
        // 1. Remove dependencies where User is a leaf or simple reference
        console.log('Deleting votes...');
        await tx.vote.deleteMany({ where: { userId: { in: userIds } } });

        console.log('Deleting ratings...');
        await tx.rating.deleteMany({ where: { userId: { in: userIds } } });

        console.log('Deleting favorites...');
        await tx.favoriteVenue.deleteMany({ where: { userId: { in: userIds } } });

        console.log('Deleting app reviews...');
        await tx.appReview.deleteMany({ where: { userId: { in: userIds } } });

        console.log('Deleting analytics events...');
        await tx.analyticsEvent.deleteMany({ where: { userId: { in: userIds } } });

        console.log('Deleting generation history...');
        await tx.generationHistory.deleteMany({ where: { userId: { in: userIds } } });

        // 2. Handle Gift Tokens
        // Update Jars that reference gifts created by these users (set sourceGiftId = null)
        // Find gifts created by users
        const userGifts = await tx.giftToken.findMany({
            where: { giftedById: { in: userIds } },
            select: { id: true }
        });
        const giftIds = userGifts.map(g => g.id);

        if (giftIds.length > 0) {
            console.log(`Unlinking jars from ${giftIds.length} gifts...`);
            await tx.jar.updateMany({
                where: { sourceGiftId: { in: giftIds } },
                data: { sourceGiftId: null }
            });

            console.log('Deleting created gifts...');
            await tx.giftToken.deleteMany({ where: { id: { in: giftIds } } });
        }

        // Unlink received gifts
        await tx.giftToken.updateMany({
            where: { acceptedById: { in: userIds } },
            data: { acceptedById: null, acceptedAt: null }
        });

        // 3. Handle Premium Tokens
        console.log('Deleting created premium tokens...');
        await tx.premiumInviteToken.deleteMany({ where: { createdById: { in: userIds } } });

        await tx.premiumInviteToken.updateMany({
            where: { usedById: { in: userIds } },
            data: { usedById: null, usedAt: null }
        });

        // 4. Handle Ideas (Complex because other users might have voted on them)
        // First, delete Votes on ideas created by these users
        console.log('Deleting votes on users ideas...');
        await tx.vote.deleteMany({
            where: {
                idea: {
                    createdById: { in: userIds }
                }
            }
        });

        // Delete Ratings on these ideas (if cascade isn't enough, but usually it is. Let's be safe)
        await tx.rating.deleteMany({
            where: {
                idea: {
                    createdById: { in: userIds }
                }
            }
        });

        console.log('Deleting users ideas...');
        await tx.idea.deleteMany({ where: { createdById: { in: userIds } } });

        // Unassign tasks
        await tx.idea.updateMany({
            where: { assignedToId: { in: userIds } },
            data: { assignedToId: null }
        });

        // 5. Memberships
        console.log('Deleting memberships...');
        await tx.jarMember.deleteMany({ where: { userId: { in: userIds } } });

        // 6. Delete Users
        console.log('Deleting users...');
        await tx.user.deleteMany({ where: { id: { in: userIds } } });
    });

    console.log('Successfully deleted users and related data.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
