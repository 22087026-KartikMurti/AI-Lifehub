import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/db/prisma"
import argon2 from 'argon2'
import { generateToken } from "@/src/utils/generateToken"

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()

  if(typeof username !== "string" || username.trim().length === 0 || typeof password !== "string" || password.trim().length === 0) 
    return NextResponse.json({ error: 'Invalid Username or Password' }, { status: 401 })

  try {
    const user = await prisma.user.findUnique({
      where: { username }
    })
   
    if(!user)
      return NextResponse.json({ error: 'Invalid Username or Password'}, { status: 401 })

    const isPasswordValid = await argon2.verify(user.hashed_password, password) 

    if(!isPasswordValid)
      return NextResponse.json({ error: 'Invalid Username or Password'}, { status: 401 })
      
    const token = generateToken(user.id)

    const response = NextResponse.json({
      success: true,
      message: 'Login Successful'
    }, { status: 200 })

    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
      path:'/'
    })

    return response

  } catch(e) {
    NextResponse.json({ error: 'Login Failed' }, { status: 500 })
  }
}

export async function DELETE() {
  const res = NextResponse.json({
    success: true,
  })

  res.cookies.delete('auth_token')

  return res
}