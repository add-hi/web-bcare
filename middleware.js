// middleware.js (project root)
import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/", "/login"]; // public pages

export function middleware(req) {
  const { nextUrl, cookies } = req;
  const pathname = nextUrl.pathname || "/";

  // --- Never intercept API or static assets (defense in depth) ---
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  const token = cookies.get("access_token")?.value;
  const isLogin = pathname === "/login";
  const isDashboard = pathname.startsWith("/dashboard");

  // If visiting /login while authenticated -> send to dashboard/home
  if (isLogin && token) {
    const url = nextUrl.clone();
    url.pathname = "/dashboard/home";
    return NextResponse.redirect(url);
  }

  // Protect /dashboard/* when not authenticated
  if (isDashboard && !token) {
    const url = nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Exclude API and static assets from running middleware
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
