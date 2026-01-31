import { NextResponse } from 'next/server';
import { removeMember, updateMemberRole } from '@/app/actions/jars';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ jarId: string; userId: string }> }
) {
    try {
        const { jarId, userId } = await params;

        if (!jarId || !userId) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        const result = await removeMember(jarId, userId);

        if (result.success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: result.error }, { status: result.status || 500 });
        }

    } catch (error) {
        console.error("Remove Member API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ jarId: string; userId: string }> }
) {
    try {
        const { jarId, userId } = await params;
        const { role } = await request.json();

        if (!jarId || !userId || !role) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        const result = await updateMemberRole(jarId, userId, role);

        if (result.success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: result.error }, { status: result.status || 500 });
        }

    } catch (error) {
        console.error("Update Member Role API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
