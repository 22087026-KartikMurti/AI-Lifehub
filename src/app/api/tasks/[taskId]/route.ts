import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/db/prisma"

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, formData } = body

    const updatedTask = await prisma.task.update({
      where: { id: id },
      data: {
        title: formData.title,
        description: formData.description || null,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        priority: formData.priority || 'medium',
        recurring: formData.recurring,
        recurringInterval: formData.recurringInterval || null,
      }
    })

    return NextResponse.json(updatedTask)

  } catch(error) {
    console.error('Failed to update task: ', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}
