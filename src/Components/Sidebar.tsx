'use client'

import ThemeSwitcher from "@/src/components/Themes/ThemeSwitcher"
import { Check, MessageSquare } from 'lucide-react'
import Button from "./Button"
import { View } from '@/src/types/view'

export function Sidebar({
  view,
  onViewChange
}: {
  view: View
  onViewChange: (view: View) => void
}) {

  return (
      <div className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-500 p-4 flex flex-col">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Task Manager <ThemeSwitcher /></h1>
        
        <nav role='navigation' aria-label='Main navigation' className="flex-1 space-y-2">
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
          </Button>
        </nav>
      </div>
  )
}