import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-response';
import { withAuth } from '@/lib/api/with-auth';
import { prisma } from '@/lib/prisma';
import { generateUniqueJarCode } from '@/lib/utils';
import { JarType, SelectionMode, MemberRole, MemberStatus } from '@prisma/client';

export const POST = withAuth(async (request, { user }) => {
    try {
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
                            userId: user.id,
                            role: MemberRole.OWNER,
                            status: MemberStatus.ACTIVE
                        }
                    }
                }
            });

            // Set as active jar for the user
            await tx.user.update({
                where: { id: user.id },
                data: { activeJarId: jar.id }
            });

            return jar;
        });

        return NextResponse.json(result);

    } catch (error: unknown) {
        return handleApiError(error);
    }
});
