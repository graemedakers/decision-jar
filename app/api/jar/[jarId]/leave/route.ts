import { NextResponse } from 'next/server';
import { leaveJar } from '@/app/actions/jars';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ jarId: string }> }
) {
    try {
        const { jarId } = await params;

        if (!jarId) {
            return NextResponse.json({ error: "Jar ID is required" }, { status: 400 });
        }

        const result = await leaveJar(jarId);

        if (result.success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: result.error }, { status: result.status || 500 });
        }

    } catch (error) {
        console.error("Leave Jar API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
