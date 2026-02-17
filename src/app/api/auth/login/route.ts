import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/db/prisma"
import argon2 from 'argon2'

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()

  if(!username || !password) 
    return NextResponse.json({ error: 'Invalid Username or Password' }, { status: 401 })

  const userFound = await prisma.user.findUnique({
    where: { username }
  })

  if(!userFound)
    return NextResponse.json({ error: 'Invalid Username or Password'}, { status: 401 })

  const isPasswordValid = await argon2.verify(userFound.hashed_password, password) 

  if(isPasswordValid) {
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
  } else {
    return NextResponse.json({ error: 'Invalid Username or Password'}, { status: 401 })
  }
}

export async function DELETE() {
  const res = NextResponse.json({
    success: true,
  })

  res.cookies.delete('auth_token')

  return res
}