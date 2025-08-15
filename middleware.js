// middleware.js (place this file at the project root, same level as package.json)
import { NextResponse } from 'next/server';

/**
 * Very light protection:
 * - If request is NOT for public paths and no access_token cookie -> redirect to /login
 * - If request is for /login but already has token -> redirect to /dashboard (adjust to your app)
 *
 * NOTE: Because we set the token from the client (non-HttpOnly cookie),
 *       this is dev-friendly. For production, consider setting an HttpOnly cookie
 *       via a Next.js Route Handler when you proxy the login endpoint.
 */
const PUBLIC_PATHS = [
  '/login',             // your /(auth)/login route is served as /login
  '/_next', '/favicon.ico', '/robots.txt', '/sitemap.xml',
];

function isPublic(pathname) {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

export function middleware(req) {
  const { nextUrl, cookies } = req;
  const pathname = nextUrl.pathname || '/';

  const token = cookies.get('access_token')?.value;

  // Already logged in but trying to access /login -> push to dashboard
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Block private routes without token
  if (!isPublic(pathname) && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

// Exclude static assets, images, and the auth route group
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
};
