import { NextResponse } from 'next/server';
import { auth } from '@/lib/next-auth-helper';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const session = await auth();
        // Allow unauthenticated unsubscribe if we rely solely on endpoint matching? 
        // Safer to require auth or use a unique token, but for now we'll check session.
        if (!session?.user?.id) {
            // Technically a user might have cleared cookies and wants to unsubscribe. 
            // Ideally we pass the endpoint and trust that (since endpoints are long random strings).
            // But for security let's enforce auth for DB operations for now.
            // If unauth, we can still return 200 so the client SW unsubs locally.
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { endpoint } = await req.json();

        if (endpoint) {
            await prisma.pushSubscription.deleteMany({
                where: { endpoint }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error removing subscription:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
