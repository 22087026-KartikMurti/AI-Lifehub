'use client'

import { useState } from "react"
import ConfirmLogout from "./ConfirmLogout"
import ThemeSwitcher from "@/src/components/Themes/ThemeSwitcher"
import { Check, LogOut, MessageSquare } from 'lucide-react'
import Button from "./Button"
import { View } from '@/src/types/view'
import getBaseUrl from "@/src/utils/getBaseUrl"
import { useRouter } from "next/navigation"

export function Sidebar({
  view,
  onViewChange
}: {
  view: View
  onViewChange: (view: View) => void
}) {
  const [isLogoutOpen, setIsLogoutOpen] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const res = await fetch(`${getBaseUrl()}/api/auth/login`, {
        method: 'DELETE',       
      })

      if(res.ok) {
        router.push('/')
        router.refresh()
      }
    } catch(error) {
      console.error('Logout failed: ', error)
    }
  }

  return (
    <>
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

        <Button
          onClick={() => setIsLogoutOpen(true)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-700"
        >
          <LogOut size={20} />
          <span className="font-medium">Log Out</span>
        </Button>
      </div>
      <ConfirmLogout isOpen={isLogoutOpen} onConfirm={handleLogout} onCancel={() => setIsLogoutOpen(false)} />
    </>
  )
}