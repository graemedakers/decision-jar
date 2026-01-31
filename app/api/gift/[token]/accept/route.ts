
import { NextResponse } from 'next/server';
import { getSession } from "@/lib/auth"; // Use unified auth helper
import { prisma } from "@/lib/prisma";
import { cloneJarForGift } from '@/lib/gift-utils';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const session = await getSession();
        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const userId = session.user.id;
        if (!userId) {
            return new NextResponse("User ID missing", { status: 400 });
        }
        const { token } = await params;

        // 1. Validate Token
        const gift = await prisma.giftToken.findUnique({
            where: { token },
            include: {
                sourceJar: true // Ensure source exists
            }
        });

        if (!gift || !gift.isActive || !gift.sourceJar) {
            return new NextResponse("Invalid gift token", { status: 404 });
        }

        if (gift.expiresAt && new Date() > gift.expiresAt) {
            return new NextResponse("Gift expired", { status: 410 });
        }

        // Check if user already accepted THIS specific gift instance?
        // Actually, DB schema allows multiple accepts for a generic token, BUT we track individual specific accepts via `acceptedById` if unique.
        // Wait, `acceptedById` on GiftToken is unique? 
        // If our schema has `acceptedById @unique`, then a token is single-use.
        // Let's check schema assumption. The spec implies multiple uses are possible if it's a shared link,
        // OR single use if it's a specific "sent" gift?
        // Re-reading spec: "30-50% viral coefficient" implies sharing widely?
        // The spec says: "Generate Gift Link" -> "Copy Link" -> Share via WhatsApp. This implies ONE link shared to potentially MANY people.
        // However, my schema implementation puts `acceptedById` on the `GiftToken` model which might limit it to ONE person if I made it unique.

        // Let's Re-verify schema:
        // `acceptedById String? @unique` <-- This limits it to ONE user.
        // If I want multi-use, I should remove `@unique` or use a separate `GiftAcceptance` model.
        // FOR MVP: Let's assume the link is generated *per recipient* OR allow the token to be re-used but only track the *last* person (bad) or remove the relationship tracking for now?
        // Actually, `maxUses` field exists in `PremiumInviteToken` but not explicitly in `GiftToken` in my plan.
        // My schema DOES have `acceptCount`.
        // Correct approach: `GiftToken` represents the link. Many users can accept it.
        // So `acceptedById` shouldn't be on `GiftToken` if it's 1:N.
        // I should create a `Jar` with `sourceGiftId`. That link is tracked on the JAR side.
        // So I don't need `acceptedBy` on the token itself to prevent re-use, unless it's a single-use token.
        // Spec says: "Generate Gift Link" ... "Share via WhatsApp" -> Implies viral sharing.
        // So I will IGNORE `acceptedById` uniqueness enforcement here, and rely on `giftsReceived` on User or just `sourceGiftId` on Jar.
        // Wait, schema has `acceptedById` on GiftToken. I should probably treat that as "First Acceptor" or just ignore it if I want multi-use.
        // Plan: Allow multi-use. I will increment `acceptCount`. I will NOT set `acceptedById` if it would violate unique constraint, 
        // OR I will fix schema later. Ideally, `GiftAcceptance` join table is better.
        // For now: I'll check if `acceptedById` is null. If it is, set it (first person). If not, just increment count.

        // 3. Clone Jar & Update State Atomically
        const result = await prisma.$transaction(async (tx) => {
            // ✅ ATOMIC CHECK: Check User Jar Limit INSIDE transaction
            const user = await tx.user.findUnique({
                where: { id: userId },
                include: {
                    memberships: {
                        include: { jar: true }
                    }
                }
            });

            const isPro = user?.isLifetimePro || user?.subscriptionStatus === 'active';

            // Refined jar counting: Exclude community jars if they exist
            const personalJars = (user?.memberships || []).filter((m: any) => {
                const refCode = m.jar?.referenceCode;
                // Exclude system/utility jars from the limit count
                return refCode !== 'BUGRPT' && refCode !== 'FEATREQ';
            });
            const currentJars = personalJars.length;

            if (!isPro && currentJars >= 2) {
                // Return a specific error object that we can handle outside the transaction
                throw new Error("JAR_LIMIT_REACHED");
            }

            // Clone the jar (passing the transaction client)
            const newJar = await cloneJarForGift(gift.sourceJarId, userId, gift.id, tx);

            // Update gift stats
            if (!gift.acceptedById) {
                await tx.giftToken.update({
                    where: { id: gift.id },
                    data: {
                        acceptCount: { increment: 1 },
                        acceptedById: userId,
                        acceptedAt: new Date()
                    }
                });
            } else {
                await tx.giftToken.update({
                    where: { id: gift.id },
                    data: {
                        acceptCount: { increment: 1 }
                    }
                });
            }

            // Update user's active jar
            await tx.user.update({
                where: { id: userId },
                data: { activeJarId: newJar.id }
            });

            return newJar;
        }, {
            timeout: 15000 // Increased timeout for heavy cloning
        });

        return NextResponse.json({
            success: true,
            jarId: result.id
        });

    } catch (error: any) {
        if (error.message === 'JAR_LIMIT_REACHED') {
            return NextResponse.json({
                error: "JAR_LIMIT_REACHED",
                message: "You have reached the free jar limit."
            }, { status: 403 });
        }
        console.error("[GIFT_ACCEPT]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
