import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/db/prisma"
import { generateToken } from "@/src/utils/tokenHelper"

export async function POST(req: NextRequest){
  const { email, code } = await req.json()

  try {
    const user = await prisma.user.findUnique({ 
      where: { email },
      select: {
        id: true,
        password_reset_code: true,
        password_reset_expires: true
      }
    })

    if(!user || !user.password_reset_code || !user.password_reset_expires) {
      return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 })
    }

    const isExpired = user.password_reset_expires.getTime() < Date.now()
    if(isExpired || String(code).trim() !== String(user.password_reset_code).trim())
      return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 })

    await prisma.user.updateMany({
      where: { email },
      data: {
        password_reset_code: null,
        password_reset_expires: null
      }
    })

    const token = generateToken(user.id)
    
    const response = NextResponse.json({
      success: true,
      message: 'Login Successful'
    }, { status: 200 })

    response.cookies.set({
      name: 'password-reset',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
      path:'/'
    })
    
    return response
  } catch {
    return NextResponse.json({ error: 'Unexpected error occurred' }, { status: 500 })
  }
}