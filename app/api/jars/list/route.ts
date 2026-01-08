
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@/lib/auth"; // Assuming auth helper exists, similar to other routes

// Simple client if not global
const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    const session = await getSession();
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const jars = await prisma.jar.findMany({
            where: {
                members: {
                    some: {
                        userId: session.user.id
                    }
                }
            },
            include: {
                members: {
                    where: { userId: session.user.id }
                },
                _count: {
                    select: { members: true, ideas: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Transform for frontend
        const result = jars.map(j => ({
            id: j.id,
            name: j.name,
            description: j.description,
            role: j.members[0]?.role || "MEMBER",
            memberCount: j._count.members,
            ideaCount: j._count.ideas,
            createdAt: j.createdAt.toISOString(),
            isCommunityJar: j.isCommunityJar,
            topic: j.topic,
            referenceCode: j.members[0]?.role === "ADMIN" ? j.referenceCode : undefined
        }));

        return NextResponse.json(result);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
