'use client'

import ThemeSwitcher from "@/src/Components/Themes/ThemeSwitcher"
import { Check, MessageSquare } from 'lucide-react'
import Button from "./Button"
import { Task } from "../types/task"
import { View } from '@/src/types/view'

export function Sidebar({
  view,
  tasks,
  onViewChange
}: {
  view: View
  tasks: Task[]
  onViewChange: (view: View) => void
}) {

  return (
      <div className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-500 p-4 flex flex-col">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Task Manager <ThemeSwitcher /></h1>
        
        <nav className="flex-1 space-y-2">
          <Button
            onClick={() => onViewChange('chat')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              view === 'chat' 
                ? 'bg-blue-500 text-gray-50 dark:bg-blue-200 dark:text-gray-700' 
                : 'text-blue-600 hover:bg-blue-50 dark:text-blue-50 dark:hover:bg-gray-700'
            }`}
          >
            <MessageSquare size={20} />
            <span className="font-medium">Chat</span>
          </Button>
          
          <Button
            onClick={() => onViewChange('tasks')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              view === 'tasks' 
                ? 'bg-blue-500 text-gray-50 dark:bg-blue-200 dark:text-gray-700' 
                : 'text-blue-600 hover:bg-blue-50 dark:text-blue-50 dark:hover:bg-gray-700'
            }`}
          >
            <Check size={20} />
            <span className="font-medium">Tasks</span>
            <span className="ml-auto bg-gray-200 text-gray-700 dark:bg-gray-900 dark:text-gray-200 text-xs px-2 py-1 rounded-full">
              {tasks.filter(t => !t.completed).length}
            </span>
          </Button>
        </nav>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-400">
          <div className="text-sm text-gray-500 dark:text-gray-200">
            <div className="flex justify-between mb-1">
              <span>Total Tasks</span>
              <span className="font-medium text-gray-700 dark:text-gray-50">{tasks.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Completed</span>
              <span className="font-medium text-gray-700 dark:text-gray-50">
                {tasks.filter(t => t.completed).length}
              </span>
            </div>
          </div>
        </div>
      </div>
  )
}