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

        // Find Jar
        const jar = await prisma.jar.findUnique({
            where: { referenceCode: code.toUpperCase() },
            include: { members: true }
        });

        if (!jar) {
            return NextResponse.json({ error: "Invalid jar code" }, { status: 404 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const { getLimits } = await import('@/lib/premium');
        const limits = getLimits(user);

        // Check jar count limit
        const currentJarCount = await prisma.jarMember.count({
            where: { userId: user.id }
        });

        if (currentJarCount >= limits.maxJars) {
            return NextResponse.json({
                error: `Limit reached: You can only have ${limits.maxJars} jar(s) on the Free plan. Please upgrade to Pro for more.`
            }, { status: 403 });
        }

        // Check if already a member
        const existingMembership = await prisma.jarMember.findUnique({
            where: {
                userId_jarId: {
                    jarId: jar.id,
                    userId: session.user.id
                }
            }
        });

        if (existingMembership) {
            // Already a member, just switch
            await prisma.user.update({
                where: { id: session.user.id },
                data: { activeJarId: jar.id }
            });
            return NextResponse.json({ success: true, message: "Already a member, switched to jar." });
        }

        // Check member limits (consistent across all jar types)
        if (jar.members.length >= limits.maxMembersPerJar) {
            return NextResponse.json({
                error: `This jar is full (max ${limits.maxMembersPerJar} members). Upgrade to Pro for more.`
            }, { status: 403 });
        }

        // Check Premium Token from invite
        let isPremiumGifted = false;
        try {
            if (premiumToken) {
                const inviter = await prisma.user.findFirst({
                    where: { premiumInviteToken: premiumToken }
                });

                if (inviter && inviter.email === 'graemedakers@gmail.com') {
                    isPremiumGifted = true;
                }
            }
        } catch (e) {
            console.error("Error validating premium token during join", e);
        }

        // Join
        await prisma.$transaction(async (tx) => {
            await tx.jarMember.create({
                data: {
                    jarId: jar.id,
                    userId: session.user.id,
                    role: 'MEMBER'
                }
            });

            await tx.user.update({
                where: { id: session.user.id },
                data: {
                    activeJarId: jar.id,
                    ...(isPremiumGifted ? { isLifetimePro: true } : {})
                }
            });
        });

        return NextResponse.json({ success: true, premiumGifted: isPremiumGifted });

    } catch (error) {
        console.error("Join Jar Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
