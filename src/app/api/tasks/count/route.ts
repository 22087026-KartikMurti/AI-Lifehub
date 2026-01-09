import { NextResponse } from "next/server"
import { prisma } from "@/db/prisma"

export async function GET() {
  try {
    const count = await prisma.task.count({
      where: { completed: false }
    })

    return NextResponse.json({ count })
  } catch(error) {
    console.error('Failed to fetch task count: ', error)
    return NextResponse.json({ error: 'Failed to fetch task count'}, { status: 500 })
  }
}