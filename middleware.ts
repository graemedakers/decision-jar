import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const { auth } = NextAuth(authConfig);

const secretKey = process.env.AUTH_SECRET || "secret-key-change-me-in-prod";
const key = new TextEncoder().encode(secretKey);

async function decrypt(input: string): Promise<any> {
    const { payload } = await jwtVerify(input, key, {
        algorithms: ['HS256'],
    });
    return payload;
}

export default auth(async (req) => {
    const path = req.nextUrl.pathname;
    const isLoggedIn = !!req.auth;

    // Custom session detection (legacy)
    const customSession = req.cookies.get('session')?.value;
    let isCustomLoggedIn = false;
    if (customSession) {
        try {
            await decrypt(customSession);
            isCustomLoggedIn = true;
        } catch (e) { }
    }

    const isAuthenticated = isLoggedIn || isCustomLoggedIn;

    // 1. Landing Page Redirect (if logged in)
    if (path === '/') {
        if (isAuthenticated) {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }
    }

    // 2. Protected Routes
    if (path.startsWith('/dashboard') || path.startsWith('/jar') || path.startsWith('/memories')) {
        if (!isAuthenticated) {
            return NextResponse.redirect(new URL('/', req.url));
        }
    }

    const response = NextResponse.next();

    // Security Headers (Apply to ALL responses)
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Content Security Policy
    const csp = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https: blob:; font-src 'self' data: https:; connect-src 'self' https: wss:; frame-src 'self' https:;";
    response.headers.set('Content-Security-Policy', csp);

    return response;
});

export const config = {
    // Match everything BUT static files and next internals
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}
