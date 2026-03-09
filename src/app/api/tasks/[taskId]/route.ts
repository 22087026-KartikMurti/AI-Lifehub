import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/db/prisma"
import { verifyToken } from "@/src/utils/tokenHelper"

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value
    if(!token)
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const userId = verifyToken(token).id

    const { id, formData } = await request.json()

    const existing = await prisma.task.findUnique({ where: { id } })
    if(!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 })
    }

    const updatedTask = await prisma.task.update({
      where: { id },
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
    if(error instanceof Error && error.message === "Invalid Session")
      return NextResponse.json({error: error.message}, { status: 401 })
    
    console.error('Failed to update task: ', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}
