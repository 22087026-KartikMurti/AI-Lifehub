import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/src/lib/db/prisma"
import argon2 from 'argon2'
import { generateToken } from "@/src/utils/tokenHelper"
import redisClient from "@/src/lib/redis"

const MAX_ATTEMPTS = 5 //Max login attempts
const ATTEMPTS_DEFAULT_RESET_TIMER = 60 * 60 //Timer for deleting a failed attempt from memory
const LOGIN_LOCK_TIMER = 10 * 60 //Timer until user can try logging in after max attempts failed

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') //user ip address

  //key to remember how many current attempts made and stored in memory
  const attemptKey = `login_attempts:${ip}` 

  //key for attempt lock after failing max attempts
  const lockTimerKey = `login_lock_timer:${ip}` 

  try {
    //Check if user is locked from login attempts
    const lockExpiry = await redisClient.get(lockTimerKey)
    if(lockExpiry) {
      const remainingTime = await redisClient.ttl(lockTimerKey)
      return NextResponse.json(
        { error: `Too many attempts. Please try again in ${remainingTime} seconds.` }, 
        { status: 429 }
      )
    }

    //check if they have reached or exceeded login attempts, and if so, set a login lock timer
    const attempts = parseInt(await redisClient.get(attemptKey) || '0')
    if(attempts >= MAX_ATTEMPTS) {
      await redisClient.set(lockTimerKey, Date.now().toString())
      await redisClient.expire(lockTimerKey, LOGIN_LOCK_TIMER)
      await redisClient.del(attemptKey)
      return NextResponse.json(
        { error: `Too many attempts. Try again in ${LOGIN_LOCK_TIMER} seconds.` }, 
        { status: 429 }
      )
    }
  } catch {
    return NextResponse.json({ error: 'Error attempting login.' }, { status: 500 })
  }

  const { username, password } = await req.json()

  if(typeof username !== "string" || username.trim().length === 0) 
    return NextResponse.json({ error: 'Invalid Username or Password' }, { status: 401 })

  if(typeof password !== "string" || password.trim().length === 0)
    return NextResponse.json({ error: 'Invalid Username or Password' }, { status: 401 })

  try {
    //find user
    const user = await prisma.user.findUnique({
      where: { username }
    })
   
    //user check
    if(!user) {
      await redisClient.incr(attemptKey)
      await redisClient.expire(attemptKey, ATTEMPTS_DEFAULT_RESET_TIMER)
      return NextResponse.json(
        { error: 'Invalid Username or Password'}, 
        { status: 401 }
      )
    }

    //password check
    const isPasswordValid = await argon2.verify(user.hashed_password, password) 
    if(!isPasswordValid) {
      await redisClient.incr(attemptKey)
      await redisClient.expire(attemptKey, ATTEMPTS_DEFAULT_RESET_TIMER)
      return NextResponse.json(
        { error: 'Invalid Username or Password'}, 
        { status: 401 }
      )
    }

    //delete failed attempts and lock timer (clean-up) keys if user has logged in
    await redisClient.del(attemptKey)
    await redisClient.del(lockTimerKey)
      
    const token = generateToken(user.id) //jwt token generated using user ID

    //create response for auth_token later on
    const response = NextResponse.json({
      success: true,
      message: 'Login Successful'
    }, { status: 200 })

    // set auth_token (login)
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

// delete auth_token (logout)
export async function DELETE() {
  const res = NextResponse.json({
    success: true,
  })

  res.cookies.delete('auth_token')

  return res
}