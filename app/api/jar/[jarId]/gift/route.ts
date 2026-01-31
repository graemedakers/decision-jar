import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateGiftToken } from '@/lib/gift-utils';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ jarId: string }> }
) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { jarId } = await params;
        const body = await request.json();
        const { personalMessage, isMysteryMode, revealPace } = body;

        if (!jarId) {
            return NextResponse.json({ error: "Jar ID is required" }, { status: 400 });
        }

        // Verify ownership/membership
        const membership = await prisma.jarMember.findUnique({
            where: {
                userId_jarId: {
                    userId: session.user.id,
                    jarId: jarId
                }
            }
        });

        if (!membership) {
            return NextResponse.json({ error: "You don't have permission to gift this jar" }, { status: 403 });
        }

        // Generate token
        const token = await generateGiftToken();

        // Create gift token
        const giftToken = await prisma.giftToken.create({
            data: {
                token,
                sourceJarId: jarId,
                giftedById: session.user.id,
                personalMessage: personalMessage || '',
                isMysteryMode: !!isMysteryMode,
                revealPace: revealPace || "INSTANT",
                isActive: true,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days expiry
            }
        });

        // Update user stats
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                giftsThisMonth: { increment: 1 }
            }
        });

        // Generate robust share URL using request origin fallback to NEXTAUTH_URL
        let origin = '';
        try {
            const url = new URL(request.url);
            origin = url.origin;
        } catch (e) {
            origin = process.env.NEXTAUTH_URL || 'https://spinthejar.com';
        }

        // Ensure no trailing slash on origin
        origin = origin.replace(/\/$/, '');
        const shareUrl = `${origin}/gift/${token}`;

        return NextResponse.json({
            success: true,
            gift: {
                token,
                url: shareUrl,
                expiresAt: giftToken.expiresAt?.toISOString()
            }
        });

    } catch (error: any) {
        console.error("Gift Jar API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message },
            { status: 500 }
        );
    }
}
