import { NextResponse, NextRequest } from 'next/server'
import { verifyToken } from '@/src/utils/tokenHelper'

export function proxy(request: NextRequest) {

  const pathname = request.nextUrl.pathname
  const authToken = request.cookies.get('auth_token')?.value

  //Home page
  if(pathname === '/')
    return NextResponse.next()

  //Redirects to task-manager page if user already logged in
  if(pathname === '/login' || pathname === '/signup') {
    if(!authToken)
      return NextResponse.next()

    //Valid auth_token redirects to task-manager page
    try {
      verifyToken(authToken)
      return NextResponse.redirect(new URL('/task-manager', request.url))
    } catch {
      return NextResponse.next()
    }
  }
  
  //Check if user is authenticated
  if (!authToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  //Invalid auth_token redirects to login page
  try {
    verifyToken(authToken)
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/login', request.url))
  }  
}

//Specify which routes to protect
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - /api/auth/* (authentication routes)
     * - /_next/static (static files)
     * - /_next/image (image optimization)
     * - /favicon.ico (favicon)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}