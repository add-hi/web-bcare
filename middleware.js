// middleware.js
import { NextResponse } from "next/server";

/**
 * No cookies, no server-side auth checks.
 * Let the client (layouts/pages) guard using the zustand auth state.
 * This middleware just passes everything through.
 */
export function middleware() {
  return NextResponse.next();
}

// Keep the matcher to avoid touching static assets (no-op either way)
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
