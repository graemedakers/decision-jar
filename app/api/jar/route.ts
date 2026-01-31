import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateUniqueJarCode } from '@/lib/utils';
import { JarType, SelectionMode, MemberRole, MemberStatus } from '@prisma/client';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name, type, topic, selectionMode } = body;

        // Generate a unique join code
        const referenceCode = await generateUniqueJarCode();

        const result = await prisma.$transaction(async (tx) => {
            // Create the jar
            const jar = await tx.jar.create({
                data: {
                    name: name || "My Jar",
                    type: (type as JarType) || JarType.SOCIAL,
                    topic: topic || 'General',
                    selectionMode: (selectionMode as SelectionMode) || SelectionMode.RANDOM,
                    referenceCode,
                    members: {
                        create: {
                            userId: session.user.id as string,
                            role: MemberRole.OWNER,
                            status: MemberStatus.ACTIVE
                        }
                    }
                }
            });

            // Set as active jar for the user
            await tx.user.update({
                where: { id: session.user.id },
                data: { activeJarId: jar.id }
            });

            return jar;
        });

        return NextResponse.json(result);

    } catch (error: any) {
        console.error("Create Jar API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message },
            { status: 500 }
        );
    }
}
