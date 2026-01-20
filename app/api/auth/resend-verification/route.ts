import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/mailer';

export async function POST(request: Request) {
    console.log("Resend verification API called");
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() },
            select: {
                id: true,
                email: true,
                name: true,
                emailVerified: true,
                verificationToken: true,
            }
        });

        if (!user) {
            // Don't reveal if user exists or not (security)
            return NextResponse.json({
                success: true,
                message: 'If an account exists with that email, a verification link has been sent.'
            });
        }

        // Already verified
        if (user.emailVerified) {
            return NextResponse.json({
                error: 'Email is already verified'
            }, { status: 400 });
        }

        // No verification token (OAuth user?)
        if (!user.verificationToken) {
            return NextResponse.json({
                error: 'This account does not require email verification'
            }, { status: 400 });
        }

        // Resend verification email
        await sendVerificationEmail(user.email, user.verificationToken);

        return NextResponse.json({
            success: true,
            message: 'Verification email sent successfully'
        });

    } catch (error) {
        console.error('Resend verification error:', error);
        return NextResponse.json({
            error: 'Failed to send verification email'
        }, { status: 500 });
    }
}
