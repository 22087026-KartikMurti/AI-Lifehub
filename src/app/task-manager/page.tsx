'use client'

import { useState, useEffect } from 'react'

// Types
import { View } from '@/src/types/view'

// Components
import ChatSection from '@/src/Components/Views/ChatSection'
import TasksPage from '@/src/Components/Views/TasksSection'
import { Sidebar } from '@/src/Components/Sidebar'
import { useTheme } from '@/src/Components/Themes/ThemeProvider'

export default function TaskManager() {
  const [view, setView] = useState<View>('chat')
  const { mounted } = useTheme()

  if(!mounted) {
    return null
  }

  return (
    <div className="flex h-screen">
      <Sidebar
        view={view}
        onViewChange={setView}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {(() => {
          switch(view) {
            case 'chat':
              return (
                <ChatSection />
              )
            case 'tasks':
              return (
                <TasksPage />
              )
            default:
              return null
          }
        })()}
      </div>
    </div>
  );
}