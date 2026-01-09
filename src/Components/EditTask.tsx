'use client'

import { useState, useEffect } from 'react'
import Button from './Button'
import { Task } from '@/src/types/task'
import { X } from 'lucide-react'

export default function EditTask({
  task,
  onSave,
  onClose
}: {
  task: Task
  onSave: (formData: Partial<Task>) => void
  onClose: () => void
}) {
  const [formData, setFormData] = useState<Partial<Task>>({})

  useEffect(() => {
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate,
      recurring: task.recurring,
      recurringInterval: task.recurringInterval
    })
  }, [task])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-gray-500/30 dark:bg-gray-200/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Edit Task</h3>
          <Button
            aria-label='Close button'
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-600 dark:text-gray-300" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor='title' className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              id='title'
              value={formData.title || ''}
              onChange={(e) => {
                const value = e.target.value.slice(0, 50)
                setFormData({ ...formData, title: value })
              }}
              maxLength={50}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
            <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
              {formData.title?.length || 0}/50 characters
            </p>
          </div>

          <div>
            <label htmlFor='description' className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id='description'
              value={formData.description || ''}
              onChange={(e) => {
                const value = e.target.value.slice(0, 200)
                setFormData({ ...formData, description: value })
              }}
              maxLength={200}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
              {formData.description?.length || 0}/200 characters
            </p>
          </div>

          <div>
            <label htmlFor='priority' className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Priority
            </label>
            <select
              id='priority'
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
            <label htmlFor='dueDate' className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Due Date
            </label>
            <input
              id='dueDate'
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
              <label htmlFor='recurringInt' className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Recurring Interval
              </label>
              <input
                id='recurringInt'
                type="text"
                value={formData.recurringInterval || ''}
                onChange={(e) => {
                  const value = e.target.value.slice(0, 20)
                  setFormData({ ...formData, recurringInterval: value })
                }}
                maxLength={20}
                placeholder="e.g., daily, weekly, monthly"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                {formData.recurringInterval?.length || 0}/20 characters
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              aria-label='Cancel'
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </Button>
            <Button
              aria-label='Save Changes'
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}