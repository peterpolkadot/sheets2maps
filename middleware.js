import { NextResponse } from 'next/server';

export function middleware(request) {
  // Skip API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Skip login page itself
  if (request.nextUrl.pathname === '/login') {
    return NextResponse.next();
  }

  const SITE_PASSWORD = process.env.SITE_PASSWORD;
  
  if (!SITE_PASSWORD) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get('site-auth');
  
  if (authCookie?.value === SITE_PASSWORD) {
    return NextResponse.next();
  }

  // Redirect to login for any protected route
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('returnTo', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/', '/map1/:path*', '/map2/:path*'],
};