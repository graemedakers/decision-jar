import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/next-auth-helper";
import { generateGiftToken } from '@/lib/gift-utils';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();

    if (!session || !session.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id: jarId } = await params;
    const userId = session.user.id;
    if (!userId) {
        return new NextResponse("User ID missing", { status: 400 });
    }

    try {
        const { personalMessage, expiresInDays = 90 } = await req.json();

        // 0. Check for existing active token for this jar/user
        const existingGift = await prisma.giftToken.findFirst({
            where: {
                sourceJarId: jarId,
                giftedById: userId,
                isActive: true,
                expiresAt: { gt: new Date() }
            }
        });

        if (existingGift) {
            // Update message if changed
            if (personalMessage !== undefined && personalMessage !== existingGift.personalMessage) {
                await prisma.giftToken.update({
                    where: { id: existingGift.id },
                    data: { personalMessage }
                });
            }

            return NextResponse.json({
                success: true,
                gift: {
                    ...existingGift,
                    personalMessage: personalMessage ?? existingGift.personalMessage,
                    url: `${process.env.NEXTAUTH_URL || 'https://spinthejar.com'}/gift/${existingGift.token}`,
                }
            });
        }

        // 1. Validate Access (Must be OWNER or ADMIN)
        const membership = await prisma.jarMember.findFirst({
            where: {
                jarId: jarId,
                userId: userId,
                role: { in: ['OWNER', 'ADMIN'] }
            }
        });

        if (!membership) {
            return new NextResponse("Forbidden: You must be an Owner or Admin to gift a jar.", { status: 403 });
        }

        // 2. Validate Jar Content (Minimum 5 ideas)
        const ideasCount = await prisma.idea.count({
            where: { jarId: jarId, status: 'APPROVED' }
        });

        if (ideasCount < 5) {
            return new NextResponse("Jar must have at least 5 approved ideas to be gifted.", { status: 400 });
        }

        // 3. Rate Limiting (Free Users: 2/month)
        // Fetch user plan status
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                subscriptionStatus: true,
                isLifetimePro: true,
                giftsThisMonth: true
            }
        });

        const isPro = user?.isLifetimePro || user?.subscriptionStatus === 'active';

        // Check limit if not pro
        if (!isPro && (user?.giftsThisMonth || 0) >= 2) {
            return new NextResponse("Monthly gift limit reached. Upgrade to Pro for unlimited gifting.", { status: 429 });
        }

        // 4. Generate Token & Create Record
        const token = await generateGiftToken();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresInDays);

        const gift = await prisma.giftToken.create({
            data: {
                token,
                sourceJarId: jarId,
                giftedById: userId,
                personalMessage,
                expiresAt,
                isActive: true
            }
        });

        // 5. Update Usage Stats
        await prisma.user.update({
            where: { id: userId },
            data: {
                giftsThisMonth: { increment: 1 },
                lastGiftSentAt: new Date()
            }
        });

        // 6. Return Data
        return NextResponse.json({
            success: true,
            gift: {
                ...gift,
                url: `${process.env.NEXTAUTH_URL || 'https://spinthejar.com'}/gift/${gift.token}`,
            }
        });

    } catch (error) {
        console.error("[GIFT_CREATE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
