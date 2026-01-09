import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

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

    // 1. Landing Page Redirect (if logged in)
    if (path === '/') {
        const session = request.cookies.get('session')?.value;
        const nextAuthSession = request.cookies.get('next-auth.session-token')?.value ||
            request.cookies.get('__Secure-next-auth.session-token')?.value;

        if (session || nextAuthSession) {
            // Basic verification attempt (optional, or just redirect)
            if (nextAuthSession) {
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
            if (session) {
                try {
                    await decrypt(session);
                    return NextResponse.redirect(new URL('/dashboard', request.url));
                } catch (e) { /* invalid */ }
            }
        }
    }

    // 2. Protected Routes
    if (path.startsWith('/dashboard') || path.startsWith('/jar') || path.startsWith('/memories')) {
        const session = request.cookies.get('session')?.value;
        const nextAuthSession = request.cookies.get('next-auth.session-token')?.value ||
            request.cookies.get('__Secure-next-auth.session-token')?.value;

        if (!session && !nextAuthSession) {
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
