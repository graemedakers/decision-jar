import { prisma } from '@/lib/prisma';
import { login } from '@/lib/auth';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email: rawEmail, password } = body;
        const email = rawEmail?.toLowerCase().trim();

        if (!email || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Check password
        if (!user.passwordHash) {
            return NextResponse.json({
                error: 'This account was created using Google or Facebook. Please use social login to continue.'
            }, { status: 401 });
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Check if email is verified
        if (!user.emailVerified && user.verificationToken) {
            return NextResponse.json({ error: 'Please verify your email address before logging in.' }, { status: 403 });
        }

        // Login
        await login({
            id: user.id,
            email: user.email,
            name: user.name,
            jarId: user.activeJarId,
            activeJarId: user.activeJarId,
            isLifetimePro: user.isLifetimePro,
            stripeSubscriptionId: user.stripeSubscriptionId,
            subscriptionStatus: user.subscriptionStatus,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
