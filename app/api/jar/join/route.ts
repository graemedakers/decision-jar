import { NextResponse } from 'next/server';
import { joinJar } from '@/app/actions/jars';

export async function POST(request: Request) {
    try {
        const { code, premiumToken } = await request.json();

        if (!code) {
            return NextResponse.json({ error: "Invite code is required" }, { status: 400 });
        }

        const result = await joinJar(code, premiumToken);

        if (result.success) {
            return NextResponse.json(result.data);
        } else {
            return NextResponse.json({ error: result.error }, { status: result.status || 500 });
        }

    } catch (error) {
        console.error("Join Jar API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
