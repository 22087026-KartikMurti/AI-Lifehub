import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/src/lib/db/prisma"
import argon2 from 'argon2'
import { generateToken } from "@/src/utils/tokenHelper"
import redisClient from "@/src/lib/redis"

const MAX_ATTEMPTS = 5
const ATTEMPTS_DEFAULT_RESET_TIMER = 60 * 60
const LOGIN_LOCK_TIMER = 10 * 60

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')
  console.log('IP address: ', ip)
  const attemptKey = `login_attempts:${ip}`
  const lockTimer = `login_lock_timer:${ip}`

  try {
    const lockExpiry = await redisClient.get(lockTimer)
    if(lockExpiry) {
      const remainingTime = Math.ceil(((parseInt(lockExpiry) + (1000 * 60 * 10)) - Date.now()) / 1000)
      return NextResponse.json({ error: `Too many attempts. Please try again in ${remainingTime} seconds.` }, { status: 429 })
    }

    const attempts = parseInt(await redisClient.get(attemptKey) || '0')
    if(attempts >= MAX_ATTEMPTS) {
      await redisClient.set(lockTimer, Date.now().toString())
      await redisClient.expire(lockTimer, LOGIN_LOCK_TIMER)
      redisClient.del(attemptKey)
      return NextResponse.json({ error: `Too many attempts. Try again in ${LOGIN_LOCK_TIMER} seconds.` }, { status: 429 })
    }
  } catch(err) {
    console.error(err)
    return NextResponse.json({ error: 'Error attempting login.' }, { status: 500 })
  }

  const { username, password } = await req.json()

  if(typeof username !== "string" || username.trim().length === 0 || typeof password !== "string" || password.trim().length === 0) 
    return NextResponse.json({ error: 'Invalid Username or Password' }, { status: 401 })

  try {
    const user = await prisma.user.findUnique({
      where: { username }
    })
   
    if(!user) {
      await redisClient.incr(attemptKey)
      await redisClient.expire(attemptKey, ATTEMPTS_DEFAULT_RESET_TIMER)
      return NextResponse.json({ error: 'Invalid Username or Password'}, { status: 401 })
    }

    const isPasswordValid = await argon2.verify(user.hashed_password, password) 
    if(!isPasswordValid) {
      await redisClient.incr(attemptKey)
      await redisClient.expire(attemptKey, ATTEMPTS_DEFAULT_RESET_TIMER)
      return NextResponse.json({ error: 'Invalid Username or Password'}, { status: 401 })
    }

    await redisClient.del(attemptKey)
    await redisClient.del(lockTimer)
      
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

  } catch {
    return NextResponse.json({ error: 'Login Failed' }, { status: 500 })
  }
}

export async function DELETE() {
  const res = NextResponse.json({
    success: true,
  })

  res.cookies.delete('auth_token')

  return res
}