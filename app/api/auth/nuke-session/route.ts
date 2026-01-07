
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const cookieStore = await cookies();

    // Forcefully delete all known auth cookies
    const options = { path: '/', maxAge: 0, expires: new Date(0) };

    cookieStore.set('session', '', options);
    cookieStore.set('next-auth.session-token', '', options);
    cookieStore.set('__Secure-next-auth.session-token', '', options);
    cookieStore.set('next-auth.csrf-token', '', options);
    cookieStore.set('__Host-next-auth.csrf-token', '', options);

    // Redirect to home
    const url = new URL('/', request.url);
    return NextResponse.redirect(url);
}
