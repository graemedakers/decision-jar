
import { Metadata } from 'next';
import { prisma } from "@/lib/prisma";
import { GiftClientPage } from './GiftClientPage';

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
    const { token } = await params;

    try {
        const gift = await prisma.giftToken.findUnique({
            where: { token },
            include: {
                giftedBy: { select: { name: true } },
                sourceJar: { select: { name: true } }
            }
        });

        if (!gift || !gift.isActive) {
            return {
                title: "Gift Not Found | Decision Jar",
            };
        }

        const title = `${gift.giftedBy.name} sent you a Jar!`;
        const description = `Check out "${gift.sourceJar.name}" - a handcrafted collection of ideas gifted to you by ${gift.giftedBy.name}. Accept the gift to add it to your Decision Jar dashboard.`;

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
            }
        };
    } catch (error) {
        return {
            title: "Gift | Decision Jar",
        };
    }
}

export default async function GiftLandingPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    let giftData = null;
    let error = null;

    try {
        const gift = await prisma.giftToken.findUnique({
            where: { token },
            include: {
                sourceJar: {
                    select: {
                        name: true,
                        topic: true,
                        ideas: {
                            where: { status: 'APPROVED', isPrivate: false },
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
            error = "Gift not found or inactive";
        } else if (gift.expiresAt && new Date() > gift.expiresAt) {
            error = "Gift has expired";
        } else {
            const totalIdeas = await prisma.idea.count({
                where: { jarId: gift.sourceJarId, status: 'APPROVED' }
            });

            giftData = {
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
                createdAt: gift.createdAt.toISOString(),
                expiresAt: gift.expiresAt?.toISOString() || null
            };
        }
    } catch (e) {
        console.error("[GIFT_PAGE_SERVER]", e);
        error = "Internal Server Error";
    }

    return (
        <GiftClientPage
            token={token}
            initialGift={giftData as any}
            initialError={error}
        />
    );
}
