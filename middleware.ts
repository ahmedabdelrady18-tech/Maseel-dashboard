import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic =
    pathname === '/login' ||
    pathname.startsWith('/api/login') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/public') ||
    pathname === '/favicon.ico';

  const isAuthenticated =
    request.cookies.get('dashboard_auth')?.value === 'true';

  if (!isPublic && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname === '/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/dashboard/:path*',
  ],
};