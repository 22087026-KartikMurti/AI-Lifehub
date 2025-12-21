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

  useEffect(() => {
    const getTasks = async () => { 
      try {

        const userTasks = await taskService.getTasks()

        setTasks(userTasks)

      } catch(error) {
        setToast({ message: `Failed to fetch tasks: ${error}`, type: 'error'})
      }
    }

    getTasks()
  }, [])

  const handleTaskCreated = (task: Task) => {
    setTasks(prev => [...prev, task])
  }

  const handleTaskToggled = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t))
  }

  const handleTaskDeleted = (id: string, deletedTask: Task) => {
    setTasks(prev => prev.filter(t => t.id !== id))
    setToast({ 
      message: 'Task Deleted Successfully!', 
      type: 'success', 
      undo: true,
      onRestore: async () => {
        try {

          const restoredTask = await taskService.createTask(deletedTask)
          setTasks(prev => [...prev, restoredTask])
          setToast({ message: 'Task Restored!', type: 'success' })

        } catch(error) {
          setToast({ message: `Failed to restore task: ${error}`, type: 'error' })
        }
      }
    })
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
        tasks={tasks}
        onViewChange={setView}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {view === 'chat' ? (
          <>
            <ChatSection
              onTaskCreated={handleTaskCreated}
              onShowToast={setToast}
            />
          </>
        ) : (
          <>
            <TasksPage
              tasks={tasks}
              onTaskToggled={handleTaskToggled}
              onTaskDeleted={handleTaskDeleted}
              onShowToast={setToast}
            />
          </>
        )}
      </div>
    </div>
  );
}