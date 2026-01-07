import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: jarId } = await params;

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                memberships: {
                    where: { jarId }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if user is a member of this jar
        if (user.memberships.length === 0) {
            return NextResponse.json({ error: "You are not a member of this jar" }, { status: 403 });
        }

        // Update active jar
        await prisma.user.update({
            where: { id: user.id },
            data: { activeJarId: jarId }
        });

        return NextResponse.json({ success: true, jarId });

    } catch (error: any) {
        console.error("Switch jar error:", error);
        return NextResponse.json(
            { error: "Internal server error", details: error.message },
            { status: 500 }
        );
    }
}
