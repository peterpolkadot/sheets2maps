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

  // Check if password is being submitted
  const url = request.nextUrl.clone();
  const password = url.searchParams.get('password');
  
  if (password === SITE_PASSWORD) {
    const response = NextResponse.redirect(url.origin);
    response.cookies.set('site-auth', SITE_PASSWORD, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });
    return response;
  }

  // Show login page
  return NextResponse.rewrite(new URL('/login', request.url));
}

export const config = {
  matcher: '/((?!login|_next/static|_next/image|favicon.ico).*)',
};