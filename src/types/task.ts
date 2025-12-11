export type Task = {
  id: string
  title: string
  description?: string
  dueDate?: string | null
  priority: 'low' | 'medium' | 'high'
  recurring: boolean
  recurringInterval?: string | null
  completed: boolean
  createdAt: string
}