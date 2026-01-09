import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { code } = await request.json();

        if (!code) {
            return NextResponse.json({ error: "Code is required" }, { status: 400 });
        }

        const jar = await prisma.jar.findFirst({
            where: {
                OR: [
                    { referenceCode: code.toUpperCase() },
                    { referenceCode: code.toLowerCase() }
                ]
            },
            include: {
                _count: {
                    select: { members: { where: { status: 'ACTIVE' } } }
                }
            }
        });

        if (!jar) {
            return NextResponse.json({ valid: false, error: "Jar not found" });
        }

        if (jar.memberLimit && jar._count.members >= jar.memberLimit) {
            return NextResponse.json({ valid: false, error: "This jar is full" });
        }

        return NextResponse.json({
            valid: true,
            jarName: jar.name,
            topic: jar.topic,
            type: jar.type
        });

    } catch (error: any) {
        console.error("Validate Invite Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
