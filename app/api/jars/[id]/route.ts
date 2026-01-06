import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();

        // Fetch the user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                memberships: {
                    where: { jarId: id },
                    include: { jar: true }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if user is an admin of this jar
        const membership = user.memberships.find(m => m.jarId === id);
        if (!membership || membership.role !== 'ADMIN') {
            return NextResponse.json({ error: "Only admins can update jar settings" }, { status: 403 });
        }

        // Update the jar with provided fields
        const updateData: any = {};

        if (body.name !== undefined) updateData.name = body.name;
        if (body.description !== undefined) updateData.description = body.description;
        if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
        if (body.topic !== undefined) updateData.topic = body.topic;
        if (body.memberLimit !== undefined) {
            updateData.memberLimit = body.memberLimit === null ? null : parseInt(body.memberLimit);
        }
        if (body.customCategories !== undefined) updateData.customCategories = body.customCategories;

        const updatedJar = await prisma.jar.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json(updatedJar);
    } catch (error: any) {
        console.error("[JAR_UPDATE_ERROR]", error);
        return NextResponse.json({
            error: error?.message || "Internal Server Error"
        }, { status: 500 });
    }
}
