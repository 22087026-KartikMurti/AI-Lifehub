import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { prisma } from "@/db/prisma"

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { error: "Valid email is required" },
      { status: 400 }
    )
  }

  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  
  // Set expiry to 10 minutes from now
  const codeExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24) // 1 day

  // Store code in database
  try {
    const updated = await prisma.user.updateMany({
      where: { email },
      data: {
        password_reset_code: code,
        password_reset_expires: codeExpiresAt
      }
    })

    const resend = new Resend(process.env.RESEND_API_KEY)
    if(updated.count > 0) {
      await resend.emails.send({
        from: 'noreply@resend.dev',
        to: email,
        subject: 'Your Login Code',
        html: `
          Your verification code is: <strong>${code}</strong>. Code expires in 10 minutes.
          <br>
          If you didn't request to change your password, 
          please ignore this email or if you have concerns, please change your password
        `
      })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }  
}