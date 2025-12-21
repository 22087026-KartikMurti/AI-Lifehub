'use client'

import { useState, useEffect } from 'react'
import { Plus } from "lucide-react";
import { Task } from "@/src/types/task";
import { ToastProps } from "@/src/types/toast";
import { taskService } from "@/src/services/taskService";
import Toast from '../Toast';
import EditTask from '../EditTask';
import TaskPage from '../Task';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [toast, setToast] = useState<ToastProps | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [loadingTasks, setLoadingTasks] = useState(true)

  useEffect(() => {
    const getTasks = async () => { 
      try {

        const userTasks = await taskService.getTasks()

        setTasks(userTasks)

      } catch(error) {
        setToast({ message: `Failed to fetch tasks: ${error}`, type: 'error'})
      } finally {
        setLoadingTasks(false)
      }
    }

    getTasks()
  }, [])

  const openEditModal = (task: Task) => {
    setEditingTask(task)
  }
    
  const updateTask = async (formData: Partial<Task>) => {
    if(!editingTask) return

    try {
      const updatedTask = await taskService.updateTask(editingTask.id, formData)
      if(updatedTask) {
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t))
        setToast({ 
          message: 'Task Updated!', 
          type: 'success',
          undo: true,
          onRestore: async () => {
            try {
              const restoredTask = await taskService.updateTask(editingTask.id, editingTask)
              setTasks(prev => prev.filter(t => t.id !== restoredTask.id))
              setTasks(prev => [...prev, restoredTask])
              setToast({ message: 'Previous Task Restored!', type: 'success' })
            } catch(error) {
              setToast({ message: `Failed to restore previous task details: ${error}`, type: 'error' })
            }
          } 
        })
      } else {
        throw new Error('Updated task returned as null')
      }
      setEditingTask(null)
    } catch(error) {
      setToast({ message: `Failed to update task: ${error}`, type: 'error' })
    }
  }

  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id)

    if(!task) return 

    try {
      const toggledTask = await taskService.toggleTask(task.id, !task.completed)
      if(toggledTask.completed) {
        setToast({ message: 'Task Complete!', type: 'success'})
      } else {
        setToast({ message: 'Task complete undone', type: 'success'})
      }
      
      setTasks(prev => prev.map(t => t.id === toggledTask.id ? toggledTask : t))

    } catch(error) {
      // Rapid tapping/clicking is common and doesn't need an error response for Abort Errors
      if(error instanceof Error && error.name === 'AbortError') {
        return
      }
      setToast({ message: `Failed to toggle task: ${error}`, type: 'error' })
    }
  }

  const deleteTask = async (id: string) => {

    const task = tasks.find(t => t.id === id)

    if(!task) return 

    try {
      const deletedTask = await taskService.deleteTask(task.id)
      delete deletedTask.id

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
    } catch(error) {
      setToast({ message: `Failed to delete task: ${error}`, type: 'error' })
    }
  }

  return (
    <>
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
      <div className="flex-1 overflow-y-auto p-6">
        
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
            Tasks: <span className={`${tasks.filter(t => t.completed).length !== tasks.length ? 'text-yellow-600 dark:text-yellow-300' : 'text-green-500 dark:text-green-300'}`}>
              {tasks.filter(t => t.completed).length} / {tasks.length}
            </span>
          </h2>

          {loadingTasks ? (

            <div>Loading...</div>

          ) : tasks.length === 0 ? (

              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-200 mb-4">
                  <Plus size={48} className="mx-auto" />
                </div>
                <p className="text-gray-500 dark:text-gray-300 mb-2">No tasks yet</p>
                <p className="text-sm text-gray-400">
                  Go to Chat to create your first task
                </p>
              </div>

            ) : (

              <div className="space-y-3">
                {tasks.map(task => (
                  <TaskPage
                    key={`task-${task.id}`}
                    task={task}
                    onToggle={toggleTask}
                    onDelete={deleteTask}
                    onOpenModal={openEditModal}
                  />
                ))}
              </div>

            )
          }
      </div>

      {editingTask && (
        <EditTask
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={updateTask}
        />
      )}
      </div>
    </>
  )
}