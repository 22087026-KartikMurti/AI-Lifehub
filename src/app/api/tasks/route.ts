import { NextRequest, NextResponse } from "next/server"
import { prisma } from '@/db/prisma'

export async function GET() {
  try {

    const tasks = await prisma.task.findMany({
      orderBy: [
        { completed: 'asc' },
        { dueDate: 'asc' }
      ]
    })

    return NextResponse.json(tasks)

  } catch(error) {
    console.error('Failed to fetch tasks: ', error)
    return NextResponse.json({error: 'Failed to fetch tasks'}, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {

    const body = await request.json()

    const { title, priority, recurring } = body
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
    const safeDueDate = body.dueDate ? new Date(body.dueDate) : null
    if (safeDueDate && isNaN(safeDueDate.getTime())) {
      return NextResponse.json({ error: 'Invalid "dueDate" value' }, { status: 400 })
    }
    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: body.description || null,
        dueDate: safeDueDate,
        priority: taskPriority,
        recurring: recurring,
      }
    })
    
    return NextResponse.json(task, { status: 201 })

  } catch(error) {
    console.error('Failed to create task: ', error)
    return NextResponse.json({error: 'Failed to create task'}, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()

    const task = await prisma.task.update({
      where: { id: body.id },
      data: { completed: body.completed }
    })

    return NextResponse.json(task)

  } catch(error) {
    console.error('Failed to toggle task complete: ', error)
    return NextResponse.json({error: 'Failed to toggle task complete'}, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()

    const task = await prisma.task.delete({
      where: { id: body.id }
    })

    return NextResponse.json(task)

  } catch(error) {
    console.error('Failed to delete task: ', error)
    return NextResponse.json({error: 'Failed to delete task'}, { status: 500 })
  }
}