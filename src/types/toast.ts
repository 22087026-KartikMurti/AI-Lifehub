import { Task } from "@/src/types/task"

export type ToastProps = {
  message: string
  type: 'success' | 'error'
  undo?: boolean
  task?: Task
  onClose?: () => void
  onRestore?: () => void
}