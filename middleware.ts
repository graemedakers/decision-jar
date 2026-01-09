import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { getToken } from 'next-auth/jwt'

const secretKey = process.env.AUTH_SECRET || "secret-key-change-me-in-prod";
const key = new TextEncoder().encode(secretKey);

async function decrypt(input: string): Promise<any> {
    const { payload } = await jwtVerify(input, key, {
        algorithms: ['HS256'],
    });
    return payload;
}

export async function middleware(request: NextRequest) {
    const response = NextResponse.next();

    // Security Headers (Apply to ALL responses)
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Content Security Policy
    const csp = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https: blob:; font-src 'self' data: https:; connect-src 'self' https:; frame-src 'self' https:;";
    response.headers.set('Content-Security-Policy', csp);

    // --- Authentication Logic (Scoped to specific paths via code check to allow headers on others) ---
    const path = request.nextUrl.pathname;

    // Use getToken to check for NextAuth session (handles chunked cookies and secure prefixes)
    // Note: secret must match what is used in auth-options.ts
    const token = await getToken({
        req: request,
        secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
    });

    const customSession = request.cookies.get('session')?.value;

    // 1. Landing Page Redirect (if logged in)
    if (path === '/') {
        if (token || customSession) {
            // Priority to NextAuth token
            if (token) {
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
            if (customSession) {
                try {
                    await decrypt(customSession);
                    return NextResponse.redirect(new URL('/dashboard', request.url));
                } catch (e) { /* invalid */ }
            }
        }
    }

    // 2. Protected Routes
    if (path.startsWith('/dashboard') || path.startsWith('/jar') || path.startsWith('/memories')) {
        if (!token && !customSession) {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    return response;
}

export const config = {
    // Match everything BUT static files and next internals
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}
