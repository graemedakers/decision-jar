import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    const session = await getSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { code, premiumToken } = await request.json();

        if (!code) {
            return NextResponse.json({ error: "Code is required" }, { status: 400 });
        }

        // Find jar by reference code
        const jar = await prisma.jar.findFirst({
            where: {
                OR: [
                    { referenceCode: code.toUpperCase() },
                    { referenceCode: code.toLowerCase() }
                ]
            }
        });

        if (!jar) {
            return NextResponse.json({ error: "Jar not found. Check the code and try again." }, { status: 404 });
        }

        // Check if already a member
        const existingMember = await prisma.jarMember.findUnique({
            where: {
                userId_jarId: {
                    userId: session.user.id,
                    jarId: jar.id
                }
            }
        });

        if (existingMember) {
            // If already a member, just switch to it
            await prisma.user.update({
                where: { id: session.user.id },
                data: { activeJarId: jar.id }
            });
            return NextResponse.json({
                success: true,
                message: "Already a member, switched to jar.",
                jarId: jar.id
            });
        }

        let isPremiumGifted = false;
        if (premiumToken) {
            const inviter = await prisma.user.findFirst({
                where: { premiumInviteToken: premiumToken },
                select: { isSuperAdmin: true }
            });

            if (inviter?.isSuperAdmin) {
                isPremiumGifted = true;
            }
        }

        // Join the jar
        await prisma.jarMember.create({
            data: {
                userId: session.user.id,
                jarId: jar.id,
                role: 'MEMBER',
                status: 'ACTIVE'
            }
        });

        // Switch to the joined jar and update premium if gifted
        const updateData: any = { activeJarId: jar.id };
        if (isPremiumGifted) {
            updateData.isLifetimePro = true;
        }

        await prisma.user.update({
            where: { id: session.user.id },
            data: updateData
        });

        return NextResponse.json({
            success: true,
            premiumGifted: isPremiumGifted,
            jarId: jar.id
        });

    } catch (error: any) {
        console.error("Join Jar Error:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error.message
        }, { status: 500 });
    }
}
