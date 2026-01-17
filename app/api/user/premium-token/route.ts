import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import crypto from 'crypto';

export async function POST(request: Request) {
    const session = await getSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is super admin
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { isSuperAdmin: true }
    });

    if (!user?.isSuperAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const token = crypto.randomUUID();

        // Create token record in PremiumInviteToken table with security features
        await prisma.premiumInviteToken.create({
            data: {
                token,
                createdById: session.user.id,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                maxUses: 10,
                isActive: true
            }
        });

        // Also update User field for backward compatibility with existing links
        await prisma.user.update({
            where: { id: session.user.id },
            data: { premiumInviteToken: token }
        });

        console.log(`[PREMIUM_TOKEN] Created: token=${token.substring(0, 8)}... creator=${session.user.id} expires=30d maxUses=10`);

        return NextResponse.json({ success: true, token });
    } catch (error) {
        console.error("Error generating premium token", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
