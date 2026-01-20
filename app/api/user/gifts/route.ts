
import { NextResponse } from 'next/server';
import { auth } from "@/lib/next-auth-helper";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 }); // Ensure status 401 for unauthorized access
        }

        const userId = session.user.id;
        if (!userId) {
            return new NextResponse("User ID missing", { status: 400 });
        }

        // 1. Fetch Sent Gifts
        const sentGifts = await prisma.giftToken.findMany({
            where: { giftedById: userId, isActive: true },
            include: {
                sourceJar: { select: { name: true, topic: true } },
                acceptedBy: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        // 2. Fetch Received Gifts
        // We navigate from Jar -> GiftToken using sourceGiftId relationship
        // NOTE: This relies on the new `sourceGiftId` field on JAR.
        // If a user has a JAR with sourceGiftId, they received it.
        const receivedJars = await prisma.jar.findMany({
            where: {
                members: { some: { userId: userId, role: 'OWNER' } },
                sourceGiftId: { not: null }
            },
            include: {
                sourceGift: {
                    include: {
                        giftedBy: { select: { name: true, image: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // 3. Simple Stats
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                giftsThisMonth: true,
                isLifetimePro: true,
                subscriptionStatus: true
            }
        });

        const isPro = user?.isLifetimePro || user?.subscriptionStatus === 'active';
        const monthlyLimit = isPro ? 9999 : 2; // 2 gifts/month for free users

        // 4. Format Response
        const formattedSent = sentGifts.map(g => ({
            token: g.token,
            jarName: g.sourceJar?.name || "Unknown Jar",
            createdAt: g.createdAt,
            acceptCount: g.acceptCount,
            status: g.expiresAt && new Date() > g.expiresAt ? 'expired' : 'active',
            lastAcceptedBy: g.acceptedBy?.name,
            url: `${process.env.NEXTAUTH_URL || 'https://spinthejar.com'}/gift/${g.token}`
        }));

        const formattedReceived = receivedJars.map(j => ({
            jarId: j.id,
            jarName: j.name,
            receivedAt: j.createdAt, // Approximate acceptance time
            from: j.sourceGift?.giftedBy?.name || "Anonymous",
            message: j.sourceGift?.personalMessage,
            senderImage: j.sourceGift?.giftedBy?.image
        }));

        return NextResponse.json({
            sent: formattedSent,
            received: formattedReceived,
            stats: {
                sentCount: sentGifts.length,
                receivedCount: receivedJars.length,
                monthlySent: user?.giftsThisMonth || 0,
                monthlyLimit: monthlyLimit,
                canSendMore: (user?.giftsThisMonth || 0) < monthlyLimit
            }
        });

    } catch (error) {
        console.error("[USER_GIFTS]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
