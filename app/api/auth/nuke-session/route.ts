
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const cookieStore = await cookies();

    const isProduction = process.env.NODE_ENV === 'production';

    // Forcefully delete all known auth cookies with matching attributes
    // Browser requires matching Secure/Path attributes to overwrite/delete
    const commonOptions = {
        path: '/',
        maxAge: 0,
        expires: new Date(0),
        sameSite: 'lax' as const,
        secure: isProduction
    };

    // 1. Clear Custom Session
    cookieStore.set('session', '', commonOptions);

    // 2. Clear NextAuth Cookies (Secure and Non-Secure variants)
    // Note: We try both secure and non-secure variants to be safe
    cookieStore.set('next-auth.session-token', '', { ...commonOptions, secure: false });
    cookieStore.set('__Secure-next-auth.session-token', '', { ...commonOptions, secure: true });

    // 3. Clear CSRF (Just in case)
    cookieStore.set('next-auth.csrf-token', '', { ...commonOptions, secure: false });
    cookieStore.set('__Host-next-auth.csrf-token', '', { ...commonOptions, secure: true });

    // Redirect to home
    const url = new URL('/', request.url);
    return NextResponse.redirect(url);
}
