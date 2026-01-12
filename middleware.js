import { NextResponse } from 'next/server';

export function middleware(request) {
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/map1') || 
                           request.nextUrl.pathname.startsWith('/map2');
  
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith('/api/')) {
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

  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('returnTo', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/map1/:path*', '/map2/:path*'],
};