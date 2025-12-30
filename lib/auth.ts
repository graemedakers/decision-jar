import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from './prisma';

const secretKey = process.env.AUTH_SECRET || "secret-key-change-me-in-prod";
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(key);
}

export async function decrypt(input: string): Promise<any> {
    const { payload } = await jwtVerify(input, key, {
        algorithms: ['HS256'],
    });
    return payload;
}

export async function login(userData: any) {
    // Create the session
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const session = await encrypt({ user: userData, expires });

    // Save the session in a cookie
    const isProduction = process.env.NODE_ENV === 'production';
    (await cookies()).set('session', session, {
        expires,
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secure: isProduction
    });
}

export async function logout() {
    // Destroy the session
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieStore = await cookies();

    // Clear custom session
    cookieStore.set('session', '', {
        expires: new Date(0),
        path: '/',
        sameSite: 'lax',
        secure: isProduction
    });

    // Clear NextAuth sessions
    cookieStore.set('next-auth.session-token', '', {
        expires: new Date(0),
        path: '/',
        sameSite: 'lax',
        secure: isProduction
    });
    cookieStore.set('__Secure-next-auth.session-token', '', {
        expires: new Date(0),
        path: '/',
        sameSite: 'lax',
        secure: isProduction
    });
}

export async function getSession() {
    // 1. Check custom jose session
    const sessionCookie = (await cookies()).get('session')?.value;
    if (sessionCookie) {
        try {
            const payload = await decrypt(sessionCookie);
            if (payload) return payload;
        } catch (error) {
            // Fall through to NextAuth
        }
    }

    // 2. Check NextAuth session
    try {
        const { getServerSession } = await import('next-auth');
        const { authOptions } = await import('./auth-options');
        const nextAuthSession = await getServerSession(authOptions);

        console.log("NextAuth Session check:", !!nextAuthSession, nextAuthSession?.user?.email);

        if (nextAuthSession?.user?.email) {
            // Map NextAuth session to match custom session structure
            const user = await (prisma as any).user.findUnique({
                where: { email: nextAuthSession.user.email }
            });

            console.log("Database user lookup for NextAuth:", !!user);

            if (user) {
                return {
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        activeJarId: user.activeJarId,
                        coupleId: user.coupleId
                    },
                    expires: nextAuthSession.expires
                };
            }
        }
    } catch (error) {
        console.error("Error checking NextAuth session:", error);
    }

    return null;
}

export async function updateSession(request: NextRequest) {
    const session = request.cookies.get('session')?.value;
    if (!session) return;

    // Refresh the session so it doesn't expire
    const parsed = await decrypt(session);
    parsed.expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const res = NextResponse.next();
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookies.set({
        name: 'session',
        value: await encrypt(parsed),
        httpOnly: true,
        expires: parsed.expires,
        path: '/',
        sameSite: 'lax',
        secure: isProduction,
    });
    return res;
}
