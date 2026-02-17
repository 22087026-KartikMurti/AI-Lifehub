import { NextResponse, NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  if(request.nextUrl.pathname === '/')
    return NextResponse.next()

  const authToken = request.cookies.get('auth_token')
  
  // Check if user is authenticated
  if (!authToken || authToken.value !== 'authenticated') {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return NextResponse.next()
}

// Specify which routes to protect
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - /api/auth/* (authentication routes)
     * - /login (login page)
     * - /_next/static (static files)
     * - /_next/image (image optimization)
     * - /favicon.ico (favicon)
     */
    '/((?!api/auth|login|signup|_next/static|_next/image|favicon.ico).*)',
  ],
}