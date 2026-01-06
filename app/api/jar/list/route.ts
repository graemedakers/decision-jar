import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await getSession();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                memberships: {
                    include: {
                        jar: {
                            include: {
                                _count: {
                                    select: { ideas: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const jars = user.memberships.map((m: any) => ({
            id: m.jar.id,
            name: m.jar.name,
            topic: m.jar.topic,
            type: m.jar.type,
            role: m.role,
            _count: m.jar._count
        }));

        return NextResponse.json({ jars });

    } catch (error: any) {
        console.error("Error fetching jar list:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
