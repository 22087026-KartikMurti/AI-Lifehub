import { Calendar, Check, Clock, Trash2 } from "lucide-react"
import { Task } from "@/src/types/task"
import Button from "./Button"
import formatDate from "@/src/utils/formatDate"
import getPriorityColour from "@/src/utils/getPriorityColour"
import isOverdue from "@/src/utils/isOverdue"

export default function TaskPage({ 
  task,
  onToggle,
  onDelete,
  onOpenModal 
}: { 
  task: Task 
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onOpenModal: (task: Task) => void
}) {

  const shortenText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
  }

  return (
    <div
      className={`border rounded-xl p-4 transition-all ${
        task.completed
          ? 'bg-gray-50 border-gray-200 dark:bg-gray-500 dark:border-gray-700'
          : isOverdue(task.dueDate, task.completed)
            ? 'bg-red-50 border-red-300 dark:bg-gray-800 dark:border-red-500'
            : 'bg-white border-gray-300 dark:bg-gray-600 dark:border-gray-600'
      }`}
    >
      <div className="flex items-start gap-3">
        <Button
          aria-label="Toggle task completion"
          onClick={() => onToggle(task.id)}
          className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            task.completed
              ? 'bg-blue-600 border-blue-600 hover:bg-blue-400 hover:border-blue-400 dark:bg-blue-400 dark:border-blue-400 dark:hover:bg-blue-600 dark:hover:border-blue-600'
              : 'border-gray-300 hover:border-blue-600 dark:border-gray-400 dark:hover:border-blue-300'
          }`}
        >
          {task.completed && <Check size={14} className="text-white dark:text-gray-800" />}
        </Button>
        
        <div className={`flex-1 ${task.completed ? 'opacity-60' : 'opacity-100'}`}>
          <h3 className={`font-medium ${task.completed ? 'line-through text-gray-400 dark:text-gray-100' : 'text-gray-800 dark:text-gray-100'}`}>
            {shortenText(task.title, 40)}
          </h3>
          {task.description && (
            <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
              {shortenText(task.description, 50)}
            </p>
          )}
          
          <div className="flex flex-wrap gap-2 mt-2">
            {task.dueDate && (
              <span 
                className={`inline-flex items-center gap-1 text-xs ${isOverdue(task.dueDate, task.completed) ? 'bg-red-500 text-white' : 'bg-blue-50 text-blue-700 dark:bg-blue-600 dark:text-blue-100'}  px-2 py-1 rounded`}
              >
                <Calendar size={12} />
                {formatDate(task.dueDate)}
              </span>
            )}
            {task.recurring && task.recurringInterval && (
              <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-700 dark:bg-purple-700 dark:text-purple-50 px-2 py-1 rounded">
                <Clock size={12} />
                {task.recurringInterval}
              </span>
            )}
            <span className={`text-xs px-2 py-1 rounded ${getPriorityColour(task.priority)}`}>
              {task.priority}
            </span>
          </div>
        </div>
        
        <Button
          aria-label="Delete task"
          onClick={() => onDelete(task.id)}
          variant='danger'
          className="px-2 py-2 hover:bg-red-200 dark:hover:bg-red-600 rounded-full"
        >
          <Trash2 size={18} />
        </Button>
        <Button
          aria-label="Edit task"
          onClick={() => onOpenModal(task)}
          className='px-2 py-1 text-gray-800 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 rounded-full'
        >
          ...
        </Button>
      </div>
    </div>
  )
}