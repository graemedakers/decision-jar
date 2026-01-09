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

        await prisma.user.update({
            where: { id: session.user.id },
            data: { premiumInviteToken: token }
        });

        return NextResponse.json({ success: true, token });
    } catch (error) {
        console.error("Error generating premium token", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
