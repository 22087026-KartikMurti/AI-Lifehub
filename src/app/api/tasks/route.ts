import { NextRequest, NextResponse } from "next/server"
import { prisma } from '@/src/lib/db/prisma'
import { verifyToken } from "@/src/utils/tokenHelper"

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value
    if(!token)
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const userId = verifyToken(token).id
    const tasks = await prisma.task.findMany({
      where: {
        userId
      },
      orderBy: [
        { completed: 'asc' },
        { dueDate: 'asc' }
      ]
    })

    return NextResponse.json(tasks)

  } catch(error) {
    if(error instanceof Error && error.message === "Invalid Session")
      return NextResponse.json({error: error.message}, { status: 401 })
    
    console.error('Failed to fetch tasks: ', error)
    return NextResponse.json({error: 'Failed to fetch tasks'}, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value
    if(!token)
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const userId = verifyToken(token).id

    const { title, description, priority, dueDate, recurring, recurringInterval } = await request.json()
    
    const allowedPriorities = ['low', 'medium', 'high'] as const
    if (typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'Invalid or missing "title"' }, { status: 400 })
    }
    if (typeof recurring !== 'boolean') {
      return NextResponse.json({ error: 'Invalid or missing "recurring" (must be a boolean)' }, { status: 400 })
    }
    const taskPriority = (priority ?? 'medium') as string
    if (typeof taskPriority !== 'string' || !allowedPriorities.includes(taskPriority as (typeof allowedPriorities)[number])) {
      return NextResponse.json({ error: 'Invalid "priority" value' }, { status: 400 })
    }
    const safeDueDate = dueDate ? new Date(dueDate) : null
    if (safeDueDate && isNaN(safeDueDate.getTime())) {
      return NextResponse.json({ error: 'Invalid "dueDate" value' }, { status: 400 })
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description || null,
        dueDate: safeDueDate,
        priority: taskPriority,
        recurring,
        recurringInterval,
        userId
      }
    })
    
    return NextResponse.json(task, { status: 201 })

  } catch(error) {
    if(error instanceof Error && error.message === "Invalid Session")
      return NextResponse.json({error: error.message}, { status: 401 })

    console.error('Failed to create task: ', error)
    return NextResponse.json({error: 'Failed to create task'}, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value
    if(!token)
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const userId = verifyToken(token).id

    const { id, completed } = await request.json()

    const existing = await prisma.task.findUnique({ where: { id } })
    if(!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 })
    }

    const task = await prisma.task.update({
      where: { id },
      data: { completed }
    })

    return NextResponse.json(task)

  } catch(error) {
    if(error instanceof Error && error.message === "Invalid Session")
      return NextResponse.json({error: error.message}, { status: 401 })

    console.error('Failed to toggle task complete: ', error)
    return NextResponse.json({error: 'Failed to toggle task complete'}, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value
    if(!token)
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const userId = verifyToken(token).id
    const { id } = await request.json()

    const existing = await prisma.task.findUnique({ where: { id } })
    if(!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 })
    }

    const task = await prisma.task.delete({
      where: { id }
    })

    return NextResponse.json(task)

  } catch(error) {
    if(error instanceof Error && error.message === "Invalid Session")
      return NextResponse.json({error: error.message}, { status: 401 })

    console.error('Failed to delete task: ', error)
    return NextResponse.json({error: 'Failed to delete task'}, { status: 500 })
  }
}