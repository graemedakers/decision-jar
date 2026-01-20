
import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/next-auth-helper";

/**
 * Public route to fetch gift details for the landing page.
 */
export async function GET(
    req: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;

        const gift = await prisma.giftToken.findUnique({
            where: { token },
            include: {
                sourceJar: {
                    select: {
                        name: true,
                        topic: true,
                        // Fetch a few ideas for preview
                        ideas: {
                            where: { status: 'APPROVED', isPrivate: false }, // Only public ideas for preview
                            take: 3,
                            select: { description: true }
                        }
                    }
                },
                giftedBy: {
                    select: {
                        name: true,
                        image: true
                    }
                }
            }
        });

        if (!gift || !gift.sourceJar || !gift.isActive) {
            return new NextResponse("Gift not found or inactive", { status: 404 });
        }

        if (gift.expiresAt && new Date() > gift.expiresAt) {
            return new NextResponse("Gift has expired", { status: 410 });
        }

        // Count total ideas (separate query for accuracy)
        const totalIdeas = await prisma.idea.count({
            where: { jarId: gift.sourceJarId, status: 'APPROVED' }
        });

        return NextResponse.json({
            gift: {
                token: gift.token,
                gifterName: gift.giftedBy.name,
                gifterAvatar: gift.giftedBy.image,
                personalMessage: gift.personalMessage,
                jar: {
                    name: gift.sourceJar.name,
                    topic: gift.sourceJar.topic,
                    ideaCount: totalIdeas,
                    previewIdeas: gift.sourceJar.ideas
                },
                createdAt: gift.createdAt,
                expiresAt: gift.expiresAt
            }
        });

    } catch (error) {
        console.error("[GIFT_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

/**
 * Deactivate a gift token (Owner only)
 */
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { token } = await params;
        const gift = await prisma.giftToken.findUnique({ where: { token } });

        if (!gift) return new NextResponse("Not Found", { status: 404 });

        if (gift.giftedById !== session.user.id) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        await prisma.giftToken.update({
            where: { token },
            data: { isActive: false }
        });

        return new NextResponse("Gift deactivated", { status: 200 });

    } catch (error) {
        console.error("[GIFT_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
