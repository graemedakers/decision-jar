import { NextResponse } from 'next/server';
import { getJarDetails } from '@/app/actions/jars';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ jarId: string }> }
) {
    try {
        const { jarId } = await params;

        if (!jarId) {
            return NextResponse.json({ error: "Jar ID is required" }, { status: 400 });
        }

        const result = await getJarDetails(jarId);

        if (result.success) {
            return NextResponse.json({
                members: result.data.members || [],
                referenceCode: result.data.referenceCode
            });
        } else {
            return NextResponse.json({ error: result.error }, { status: result.status || 500 });
        }

    } catch (error) {
        console.error("Get Jar Members API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
