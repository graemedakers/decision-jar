import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import crypto from 'crypto';

export async function POST(request: Request) {
    const session = await getSession();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.email !== 'graemedakers@gmail.com') {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const token = crypto.randomUUID();

        await prisma.user.update({
            where: { email: session.user.email },
            data: { premiumInviteToken: token }
        });

        return NextResponse.json({ success: true, token });
    } catch (error) {
        console.error("Error generating premium token", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
