'use client'

import { useState, useEffect } from 'react'
import { Calendar, Check, Clock, Plus, Trash2 } from "lucide-react";
import Button from "../Button";
import isOverdue from "@/src/utils/isOverdue";
import formatDate from "@/src/utils/formatDate";
import getPriorityColour from "@/src/utils/getPriorityColour";
import { Task } from "@/src/types/task";
import { ToastProps } from "@/src/types/toast";
import { taskService } from "@/src/services/taskService";
import Toast from '../Toast';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [toast, setToast] = useState<ToastProps | null>(null)

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
    

  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id)

    if(!task) return 

    try {

      const updatedTask = await taskService.toggleTask(task.id, !task.completed)
      if(updatedTask.completed) {
        setToast({ message: 'Task Complete!', type: 'success'})
      } else {
        setToast({ message: 'Task complete undone', type: 'success'})
      }
      
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t))

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
          
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-600 mb-4">
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
                <div
                  key={`task-${task.id}`}
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
                      onClick={() => toggleTask(task.id)}
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
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">{task.description}</p>
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
                        {task.recurring && (
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
                      onClick={() => deleteTask(task.id)}
                      variant='danger'
                      className="px-2 py-2 hover:bg-red-200 dark:hover:bg-red-600 rounded-full transition-colors"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}