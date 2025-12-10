import { NextRequest, NextResponse } from "next/server"
import { prisma } from '@/db/prisma'

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(tasks)
  } catch(error) {
    console.error('Failed to fetch tasks: ', error)
    return NextResponse.json({error: 'Failed to fetch tasks: '}, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description || null,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        priority: body.priority || 'medium',
        recurring: body.recurring,
        recurringInterval: body.recurringInterval || null,
      }
    })

    return NextResponse.json(task, { status: 201 })
  } catch(error) {
    console.error('Failed to create task: ', error)
    NextResponse.json({error: 'Failed to create task'}, { status: 500 })
  }
}