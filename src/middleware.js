import { NextResponse } from 'next/server'

export function middleware(request) {
    // Check if accessing dashboard routes
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        // In production, check for proper JWT token in cookies
        // For demo, we'll check localStorage in client-side
        return NextResponse.next()
    }

    return NextResponse.next()
}

export const config = {
    matcher: '/dashboard/:path*'
}