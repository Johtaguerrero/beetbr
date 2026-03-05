import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ARTIST_ROUTES = ['/artist', '/deals'];
const INDUSTRY_ROUTES = ['/industry'];
const AUTH_REQUIRED = [...ARTIST_ROUTES, ...INDUSTRY_ROUTES, '/settings', '/rankings'];
const PUBLIC_ONLY = ['/auth'];

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Read auth from cookie (we'll set it on login)
    const role = req.cookies.get('BeatBR-role')?.value;
    const isAuth = req.cookies.get('BeatBR-auth')?.value === 'true';

    // Redirect authenticated users away from auth page
    if (PUBLIC_ONLY.some((p) => pathname.startsWith(p)) && isAuth) {
        const dest = role === 'ARTIST' ? '/artist/feed' : '/industry/dashboard';
        return NextResponse.redirect(new URL(dest, req.url));
    }

    // Protect authenticated routes
    if (AUTH_REQUIRED.some((p) => pathname.startsWith(p)) && !isAuth) {
        return NextResponse.redirect(new URL('/auth', req.url));
    }

    // Role-based route protection
    if (ARTIST_ROUTES.some((p) => pathname.startsWith(p)) && isAuth && role !== 'ARTIST') {
        return NextResponse.redirect(new URL('/industry/dashboard', req.url));
    }
    if (INDUSTRY_ROUTES.some((p) => pathname.startsWith(p)) && isAuth && role !== 'INDUSTRY') {
        return NextResponse.redirect(new URL('/artist/feed', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};

