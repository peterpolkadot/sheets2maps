import { NextResponse } from 'next/server';

export function middleware(request) {
  // Only protect /map1 and /map2 pages (and their sub-routes)
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/map1') || 
                           request.nextUrl.pathname.startsWith('/map2');
  
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Skip password check for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const SITE_PASSWORD = process.env.SITE_PASSWORD;
  
  // If no password is set, allow access
  if (!SITE_PASSWORD) {
    return NextResponse.next();
  }

  // Check if user has valid session cookie
  const authCookie = request.cookies.get('site-auth');
  
  if (authCookie?.value === SITE_PASSWORD) {
    return NextResponse.next();
  }

  // Redirect to login with return URL
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('returnTo', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/map1/:path*', '/map2/:path*'],
};