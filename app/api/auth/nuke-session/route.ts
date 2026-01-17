
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const cookieStore = await cookies();

    const isProduction = process.env.NODE_ENV === 'production';

    // Forcefully delete all known auth cookies with matching attributes
    // Browser requires matching Secure/Path/HttpOnly attributes to overwrite/delete
    const commonOptions = {
        path: '/',
        maxAge: 0,
        expires: new Date(0),
        sameSite: 'lax' as const,
        secure: isProduction,
        httpOnly: true  // Must match how cookies were originally set
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

    // ✅ FIX: Redirect to /login instead of / to avoid middleware redirect loop
    // Middleware redirects authenticated users from / to /dashboard, causing infinite loop
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
}
