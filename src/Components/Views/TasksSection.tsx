'use client'

import { useState, useEffect } from 'react'
import { Calendar, Check, Clock, Plus, Trash2, X } from "lucide-react";
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
  const [formData, setFormData] = useState<Partial<Task>>({})
  const [editingTask, setEditingTask] = useState<Task | null>(null)

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

  const openEditModal = (task: Task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate,
      recurring: task.recurring,
      recurringInterval: task.recurringInterval
    })
  }

  const closeEditModal = () => {
    setEditingTask(null)
    setFormData({})
  }
    
  const updateTask = async (e: React.FormEvent) => {
    e.preventDefault()
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
      closeEditModal()
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
          
          {tasks.length === 0 ? (
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
                      className="px-2 py-2 hover:bg-red-200 dark:hover:bg-red-600 rounded-full"
                    >
                      <Trash2 size={18} />
                    </Button>
                    <Button
                      onClick={() => openEditModal(task)}
                      className='px-2 py-1 text-gray-800 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-600 rounded-full'
                    >
                      ...
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {editingTask && (
        <div className="fixed inset-0 bg-gray-500/30 dark:bg-gray-200/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Edit Task</h3>
              <Button
                onClick={closeEditModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-600 dark:text-gray-300" />
              </Button>
            </div>

            <form onSubmit={updateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority
                </label>
                <select
                  value={formData.priority || 'medium'}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={
                    formData.dueDate ? 
                      new Date(formData.dueDate).toISOString().split('T')[0] 
                      : ''}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={formData.recurring || false}
                  onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="recurring" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Recurring Task
                </label>
              </div>

              {formData.recurring && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Recurring Interval
                  </label>
                  <input
                    type="text"
                    value={formData.recurringInterval || ''}
                    onChange={(e) => setFormData({ ...formData, recurringInterval: e.target.value })}
                    placeholder="e.g., daily, weekly, monthly"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}