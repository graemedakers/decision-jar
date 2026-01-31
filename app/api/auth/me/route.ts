import { NextResponse } from 'next/server';
import { getUserDetails } from '@/app/actions/user';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const result = await getUserDetails();

        if (result.success && result.data) {
            return NextResponse.json({ user: result.data.user });
        } else {
            return NextResponse.json(
                { error: result.error || "Unauthorized" },
                { status: result.status || 401 }
            );
        }
    } catch (error: any) {
        console.error("[API_AUTH_ME] Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
