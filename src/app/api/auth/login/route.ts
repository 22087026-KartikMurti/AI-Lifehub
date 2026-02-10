import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()

  if(!username || !password || password !== process.env.USER_PASSWORD) 
    return NextResponse.json({ error: 'Invalid Username or Password' }, { status: 401 })

  if(password === process.env.USER_PASSWORD) {
    const response = NextResponse.json({
      success: true,
      message: 'Login Successful'
    }, { status: 200 })

    response.cookies.set({
      name: 'auth_token',
      value: 'authenticated',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
      path:'/'
    })

    return response
  }
}

export async function DELETE() {
  const res = NextResponse.json({
    success: true,
  })

  res.cookies.delete('auth_token')

  return res
}