
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { login } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const rawToken = searchParams.get('token');
    const token = rawToken?.trim();
    const email = searchParams.get('email')?.toLowerCase().trim();

    if (!token) {
        return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    try {
        let user = null;

        // 1. Find by email if provided
        if (email) {
            user = await prisma.user.findUnique({
                where: { email },
                include: { memberships: true }
            });

            if (user) {
                if (user.emailVerified) {
                    await login({
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        jarId: user.activeJarId,
                        activeJarId: user.activeJarId
                    });
                    return NextResponse.redirect(new URL('/dashboard', request.url));
                }

                if (user.verificationToken && user.verificationToken.trim() !== token) {
                    return NextResponse.json({
                        error: 'Invalid or expired token',
                        details: `Token mismatch for ${email}.`
                    }, { status: 400 });
                }
            }
        }

        // 2. Find by token if not found or email not provided
        if (!user) {
            user = await prisma.user.findFirst({
                where: { verificationToken: token }
            });
        }

        if (!user) {
            return NextResponse.json({
                error: 'Invalid or expired token',
                details: 'Verification token not found in database.'
            }, { status: 400 });
        }

        // 3. Verify user
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: new Date(),
                verificationToken: null,
            },
        });

        // 4. Log in
        await login({
            id: updatedUser.id,
            email: updatedUser.email,
            name: updatedUser.name,
            jarId: updatedUser.activeJarId,
            activeJarId: updatedUser.activeJarId
        });

        return NextResponse.redirect(new URL('/dashboard', request.url));

    } catch (error: any) {
        console.error('Verification error:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            message: error.message
        }, { status: 500 });
    }
}
