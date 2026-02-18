import { NextResponse, NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

export function proxy(request: NextRequest) {
  if(request.nextUrl.pathname === '/')
    return NextResponse.next()

  const authToken = request.cookies.get('auth_token')?.value
  
  // Check if user is authenticated
  if (!authToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    jwt.verify(authToken, process.env.JWT_SECRET as string)
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/login', request.url))
  }  
}

// Specify which routes to protect
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - /api/auth/* (authentication routes)
     * - /login (login page)
     * - /signup (sign up page)
     * - /_next/static (static files)
     * - /_next/image (image optimization)
     * - /favicon.ico (favicon)
     */
    '/((?!api/auth|login|signup|_next/static|_next/image|favicon.ico).*)',
  ],
}