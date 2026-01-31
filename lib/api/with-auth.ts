import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { User } from '@prisma/client';

type AuthenticatedContext = {
    user: User;
    session: any;
    params?: any;
};

type AuthenticatedHandler = (
    req: NextRequest,
    context: AuthenticatedContext
) => Promise<NextResponse>;

export function withAuth(handler: AuthenticatedHandler) {
    return async (req: NextRequest, { params }: { params?: any } = {}) => {
        try {
            const session = await getSession();

            // Check session existence
            if (!session?.user?.id) {
                return NextResponse.json(
                    { error: 'Unauthorized', message: 'You must be logged in.' },
                    { status: 401 }
                );
            }

            // Check user existence in DB
            const user = await prisma.user.findUnique({
                where: { id: session.user.id }
            });

            if (!user) {
                return NextResponse.json(
                    { error: 'Unauthorized', message: 'User account not found.' },
                    { status: 401 }
                );
            }

            // Execute handler with injected user
            return await handler(req, { user, session, params });

        } catch (error: unknown) {
            console.error('[API] Auth Middleware Error:', error);
            const message = error instanceof Error ? error.message : 'Unknown error';

            return NextResponse.json(
                { error: 'Internal Server Error', message },
                { status: 500 }
            );
        }
    };
}
