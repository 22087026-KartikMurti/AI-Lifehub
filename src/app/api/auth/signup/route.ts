import { NextRequest, NextResponse } from 'next/server'
import { prisma } from "@/src/lib/db/prisma"
import argon2 from "argon2"

export async function POST(req: NextRequest) {
  try {
    const { username, email, firstName, lastName, password } = await req.json()

    if(typeof username !== "string" || username.trim().length === 0) {
      return NextResponse.json({ error: 'Invalid or missing "username"' }, { status: 400 })
    }
    if(typeof email !== "string" || email.trim().length === 0) {
      return NextResponse.json({ error: 'Invalid or missing "email"' }, { status: 400 })
    }
    if(typeof firstName !== "string" || firstName.trim().length === 0) {
      return NextResponse.json({ error: 'Invalid or missing "first name"' }, { status: 400 })
    }
    if(typeof lastName !== "string" || lastName.trim().length === 0) {
      return NextResponse.json({ error: 'Invalid or missing "last name"' }, { status: 400 })
    }
    if(typeof password !== "string" || password.trim().length === 0) {
      return NextResponse.json({ error: 'Invalid or missing "password"' }, { status: 400 })
    }

    const hashed = await argon2.hash(password, { type: argon2.argon2id })

    const user = await prisma.user.create({
      data: {
        username: username.trim(),
        email: email.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        hashed_password: hashed,
      }
    })

    return NextResponse.json({ id: user.id }, { status: 201 })
  } catch(e) {
    NextResponse.json({ error: `Error creating account: ${e}` }, { status: 500 })
  }
}