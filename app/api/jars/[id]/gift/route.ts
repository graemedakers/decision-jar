import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth"; // Use unified auth helper
import { generateGiftToken } from '@/lib/gift-utils';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();

    if (!session || !session.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id: jarId } = await params;
    const userId = session.user.id;
    if (!userId) {
        return new NextResponse("User ID missing", { status: 400 });
    }

    try {
        const { personalMessage, expiresInDays = 90, isMysteryMode = false, revealPace = "INSTANT" } = await req.json();

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
            // Update message, mode, and pace if changed
            if ((personalMessage !== undefined && personalMessage !== existingGift.personalMessage) ||
                (isMysteryMode !== undefined && isMysteryMode !== existingGift.isMysteryMode) ||
                (revealPace !== undefined && revealPace !== existingGift.revealPace)) {
                await prisma.giftToken.update({
                    where: { id: existingGift.id },
                    data: {
                        personalMessage,
                        isMysteryMode,
                        revealPace
                    }
                });
            }

            return NextResponse.json({
                success: true,
                gift: {
                    ...existingGift,
                    personalMessage: personalMessage ?? existingGift.personalMessage,
                    isMysteryMode: isMysteryMode ?? existingGift.isMysteryMode,
                    revealPace: revealPace ?? existingGift.revealPace,
                    url: `${process.env.NEXTAUTH_URL || 'https://spinthejar.com'}/gift/${existingGift.token}`,
                }
            });
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
                isMysteryMode,
                revealPace,
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
