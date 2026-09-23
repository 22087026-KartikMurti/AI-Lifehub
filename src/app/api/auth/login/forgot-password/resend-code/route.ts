import redisClient from '@/src/lib/redis'
import getBaseUrl from '@/src/utils/getBaseUrl'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const RESEND_CODE_TIMER = 15

  const { email } = await req.json()

  if(!email || typeof email !== 'string' || email.trim().length === 0)
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })

  // Normalize to prevent case-based bypass (Foo@x.com vs foo@x.com)
  const normalizedEmail = email.trim().toLowerCase()
  const rateLimitKey = `resend-cooldown:${normalizedEmail}` //key for resend code timer

  // set the key only if it doesn't exist, with a 15s expiry.
  const acquired = await redisClient.set(
    rateLimitKey,
    Date.now.toString(), {
      'EX': RESEND_CODE_TIMER,
      'NX': true
    }
  )

  //if a key was created during this attempt resend a code to the user
  if(acquired) {
    const res = await fetch(`${getBaseUrl()}/api/auth/login/forgot-password/send-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: normalizedEmail })
    })

    const { error } = await res.json()

    if(!res.ok) {
      await redisClient.del(rateLimitKey)
      return NextResponse.json(
        { error: error || 'Something went wrong. Try again' }, 
        { status: 500 }
      )
    }
  } else {
    const ttl = await redisClient.ttl(rateLimitKey)
    return NextResponse.json(
      { error: 'Please wait before requesting another code', retryAfter: Math.max(ttl, 0) },
      { status: 429 }
    )
  }

  return NextResponse.json({ success: true })
}