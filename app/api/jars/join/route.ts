import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validatePremiumToken, recordTokenUsage } from '@/lib/premium-token-validator';

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

        // Validate premium token using unified validator
        let isPremiumGifted = false;
        if (premiumToken) {
            const validation = await validatePremiumToken(premiumToken);
            isPremiumGifted = validation.isValid;
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

        // Record token usage if premium was granted
        if (isPremiumGifted && premiumToken) {
            await recordTokenUsage(premiumToken, session.user.id, 'join');
        }

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
