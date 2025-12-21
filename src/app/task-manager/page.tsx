'use client'

import { useState, useEffect } from 'react'

// Services
import { taskService } from '@/src/services/taskService'

// Types
import { Task } from '@/src/types/task'
import { ToastProps } from '@/src/types/toast'
import { View } from '@/src/types/view'

// Components
import ChatSection from '@/src/Components/Views/ChatSection'
import Toast from '@/src/Components/Toast'
import TasksPage from '@/src/Components/Views/TasksSection'
import { Sidebar } from '@/src/Components/Sidebar'

export default function TaskManager() {
  const [toast, setToast] = useState<ToastProps | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [view, setView] = useState<View>('chat')

  const handleTaskCreated = (task: Task) => {
    setTasks(prev => [...prev, task])
  }

  return (
    <div className="flex h-screen">
      {toast && (
        <Toast 
          key={Date.now()}
          message={toast.message}
          type={toast.type}
          undo={toast.undo}
          onClose={() => setToast(null)}
          onRestore={toast.onRestore}
        />
      )}
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
                <ChatSection
                  onTaskCreated={handleTaskCreated}
                  onShowToast={setToast}
                />
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