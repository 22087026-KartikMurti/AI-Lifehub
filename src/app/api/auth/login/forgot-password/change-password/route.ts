import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/src/lib/db/prisma"
import argon2 from "argon2"
import { verifyToken } from "@/src/utils/tokenHelper"

export async function PATCH(req: NextRequest) {
  try {
    const { newPassword } = await req.json()
    if(typeof newPassword !== "string" || newPassword.trim().length === 0) {
      return NextResponse.json({ error: 'Invalid or missing password' }, { status: 400 })
    }

    const token = req.cookies.get("password-reset")?.value
    if(!token) {
      return NextResponse.json({ error: "unauthorised" }, { status: 401 })
    }

    const userId = verifyToken(token).id
    const hashed = await argon2.hash(newPassword, { type: argon2.argon2id })
    await prisma.user.updateMany({
      where: { id: userId },
      data: {
        hashed_password: hashed
      }
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 })
  }
}