'use client'

import { useState, useEffect } from 'react'

// Types
import { View } from '@/src/types/view'

// Components
import ChatSection from '@/src/components/Views/ChatSection'
import TasksPage from '@/src/components/Views/TasksSection'
import { Sidebar } from '@/src/components/Sidebar'
import { useTheme } from '@/src/components/Themes/ThemeProvider'

export default function TaskManager() {
  const [view, setView] = useState<View>('chat')
  const { mounted } = useTheme()

  return (
    <div className={`flex h-screen ${!mounted ? 'opacity-0' : 'opacity-100 transition-opacity'}`}>
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