import { NextResponse } from 'next/server';

export function middleware(request) {
  // Skip password check for API routes (they need to work)
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

  // Show login page
  return NextResponse.rewrite(new URL('/login', request.url));
}

export const config = {
  matcher: '/((?!login|_next/static|_next/image|favicon.ico).*)',
};