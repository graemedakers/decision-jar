import { NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-response';
import { deleteJar } from '@/app/actions/jars';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ jarId: string }> }
) {
    try {
        const { jarId } = await params;

        if (!jarId) {
            return NextResponse.json({ error: "Jar ID is required" }, { status: 400 });
        }

        const result = await deleteJar(jarId);

        if (result.success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: result.error }, { status: result.status || 500 });
        }

    } catch (error) {
        return handleApiError(error);
    }
}
