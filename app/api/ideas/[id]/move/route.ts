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

        const { id: ideaId } = await params;
        const { targetJarId } = await request.json();

        if (!targetJarId) {
            return NextResponse.json({ error: "Target jar ID is required" }, { status: 400 });
        }

        // Get the user
        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Get the idea to move  
        const idea = await prisma.idea.findUnique({
            where: { id: ideaId },
            include: {
                jar: {
                    include: {
                        members: true
                    }
                }
            }
        });

        if (!idea) {
            return NextResponse.json({ error: "Idea not found" }, { status: 404 });
        }

        // Check if user has permission to move this idea
        // User can move if they are a member of the jar (since they can manage ideas in their jar)
        const isMemberOfJar = idea.jar.members.some((m: any) => m.userId === user.id);
        const isAdmin = idea.jar.members.some((m: any) => m.userId === user.id && m.role === 'ADMIN');

        if (!isMemberOfJar) {
            return NextResponse.json({ error: "You don't have permission to move this idea" }, { status: 403 });
        }

        // Check if target jar exists and user has access
        const targetJar = await prisma.jar.findUnique({
            where: { id: targetJarId },
            include: {
                members: true
            }
        });

        if (!targetJar) {
            return NextResponse.json({ error: "Target jar not found" }, { status: 404 });
        }

        const isMemberOfTargetJar = targetJar.members.some((m: any) => m.userId === user.id);
        if (!isMemberOfTargetJar) {
            return NextResponse.json({ error: "You don't have access to the target jar" }, { status: 403 });
        }

        // Move the idea
        const updatedIdea = await prisma.idea.update({
            where: { id: ideaId },
            data: {
                jarId: targetJarId
            }
        });

        return NextResponse.json({
            success: true,
            idea: updatedIdea,
            message: `Idea moved to ${targetJar.name}`
        });

    } catch (error: any) {
        console.error("Move idea error:", error);
        return NextResponse.json(
            { error: "Internal server error", details: error.message },
            { status: 500 }
        );
    }
}
