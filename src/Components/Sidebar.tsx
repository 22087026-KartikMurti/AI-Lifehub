'use client'

import ThemeSwitcher from "@/src/Components/Themes/ThemeSwitcher"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Check, MessageSquare } from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname()

  return (
      <div className="w-64 bg-gray-50 dark:bg-gray-600 border-r border-gray-200 dark:border-gray-800 p-4 flex flex-col">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          TaskFlow AI <ThemeSwitcher />
        </h1>
        
        <nav className="flex-1 space-y-2">
          <Link
          href='/task-manager'
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            pathname === '/task-manager' 
              ? 'bg-blue-500 text-gray-50 dark:bg-blue-300 dark:text-gray-600' 
              : 'text-blue-600 hover:bg-blue-50 dark:text-blue-100 dark:hover:bg-gray-700'
          }`}
          >
            <MessageSquare size={20} />
            <span className="font-medium">Chat</span>
          </Link>
          
          <Link
            href='/task-manager/tasks'
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              pathname === '/task-manager/tasks' 
                ? 'bg-blue-500 text-gray-50 dark:bg-blue-300 dark:text-gray-600' 
                : 'text-blue-600 hover:bg-blue-50 dark:text-blue-100 dark:hover:bg-gray-700'
            }`}
          >
            <Check size={20} />
            <span className="font-medium">Tasks</span>
          </Link>
        </nav>
      </div>
  )
}