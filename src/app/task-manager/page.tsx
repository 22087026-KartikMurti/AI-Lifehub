'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Plus, Check, Trash2, Calendar, Clock, MessageSquare } from 'lucide-react'

// Utilities
import formatDate from '@/src/utils/formatDate'
import isOverdue from '@/src/utils/isOverdue'
import getPriorityColour from '@/src/utils/getPriorityColour'

// Services
import { taskService } from '@/src/services/taskService'

// Types
import { Task } from '@/src/types/task'

// Components
import Button from '@/src/Components/Button'
import { aiService } from '@/src/services/aiService'
import Toast from '@/src/Components/Toast'

type ToastProps = {
  message: string,
  type: 'success' | 'error'
  undo?: boolean
  task?: Task
  onRestore?: () => void
}

export default function TaskManager() {
  const [toast, setToast] = useState<ToastProps | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I can help you create and manage tasks. Just tell me what you need to do, and I\'ll help you organize it. Try saying something like "I need to drink water every 2 hours" or "Review project proposal by Friday".' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState('chat') // 'chat' or 'tasks'
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    const getTasks = async () => { 
      try {

        const userTasks = await taskService.getTasks()

        setTasks(userTasks)

      } catch(error) {
        setToast({ message: `Failed to fetch tasks: ${error}`, type: 'error'})
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `Error fetching your tasks: ${error}` 
        }])
      }
    }

    getTasks()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {

      const aiResponse = await aiService.processPrompt(userMessage)

      try {
        const parsed = JSON.parse(aiResponse)
        
        if(parsed.action === 'create_task') {
          try {

            const savedTask = await taskService.createTask(parsed.task)

            setTasks(prev => [...prev, savedTask])
            setToast({ message: 'Task Created Successfully!', type: 'success' })
            setMessages(prev => [...prev, { role: 'assistant', content: parsed.message }])

          } catch(error) {
            setToast({ 
              message: `There was an error creating the task in the database: ${error}`, 
              type: 'error' 
            })
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              content: `There was an error creating the task in the database: ${error}`
            }])
          }
        } else {
          setMessages(prev => [...prev, { role: 'assistant', content: parsed.message }])
        }
      } catch(error) {
        setToast({ 
          message: `There was an error with the response: ${error}`, 
          type: 'error' 
        })
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `There was an error with the response: ${error}` 
        }])
      }
    } catch(error) {
      setToast({ 
        message: `Sorry, I encountered an error: ${error}`, 
        type: 'error' 
      })
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Sorry, I encountered an error: ${error}`
      }])
    } finally {
      setLoading(false)
    }
  }

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
      setTasks(prev => prev.map(t => t.id === id ? updatedTask : t))

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

  // Conversation bubbles for loading reply from AI
  const ANIMATION_DELAYS = ['0ms', '150ms', '300ms']

  return (
    <div className="flex h-screen bg-gray-50">
      {toast && (
        <Toast 
          message={toast.message}
          type={toast.type}
          undo={toast.undo}
          onClose={() => setToast(null)}
          onRestore={toast.onRestore}
        />
      )}
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">TaskFlow AI</h1>
        
        <nav className="flex-1 space-y-2">
          <Button
            onClick={() => setView('chat')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              view === 'chat' 
                ? 'bg-blue-500 text-gray-50' 
                : 'text-blue-600 hover:bg-blue-50'
            }`}
          >
            <MessageSquare size={20} />
            <span className="font-medium">Chat</span>
          </Button>
          
          <Button
            onClick={() => setView('tasks')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              view === 'tasks' 
                ? 'bg-blue-500 text-gray-50' 
                : 'text-blue-600 hover:bg-blue-50'
            }`}
          >
            <Check size={20} />
            <span className="font-medium">Tasks</span>
            <span className="ml-auto bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
              {tasks.filter(t => !t.completed).length}
            </span>
          </Button>
        </nav>

        <div className="pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            <div className="flex justify-between mb-1">
              <span>Total Tasks</span>
              <span className="font-medium text-gray-700">{tasks.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Completed</span>
              <span className="font-medium text-gray-700">
                {tasks.filter(t => t.completed).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {view === 'chat' ? (
          <>
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-3xl mx-auto space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={`msg-${idx}`}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-800 border border-gray-200'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        {ANIMATION_DELAYS.map((delay, index) => (
                          <div
                            key={`anim-${index}`}
                            className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                            style={{ animationDelay: delay }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <form className="border-t border-gray-200 p-4 bg-white" onSubmit={handleSubmit}>
              <div className="max-w-3xl mx-auto flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe your task... (e.g., 'Drink water every hour' or 'Call mom tomorrow at 3pm')"
                  className="flex-1 px-4 py-3 text-gray-800 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <Button
                  type='submit'
                  disabled={loading || !input.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={20} />
                </Button>
              </div>
            </form>
          </>
        ) : (
          /* Tasks View */
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Tasks</h2>
              
              {tasks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Plus size={48} className="mx-auto" />
                  </div>
                  <p className="text-gray-500 mb-2">No tasks yet</p>
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
                          ? 'bg-white border-gray-200 opacity-60'
                          : isOverdue(task.dueDate, task.completed)
                          ? 'bg-red-50 border-red-300'
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Button
                          onClick={() => toggleTask(task.id)}
                          className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            task.completed
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-gray-300 hover:border-blue-600'
                          }`}
                        >
                          {task.completed && <Check size={14} className="text-white" />}
                        </Button>
                        
                        <div className="flex-1">
                          <h3 className={`font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                          )}
                          
                          <div className="flex flex-wrap gap-2 mt-2">
                            {task.dueDate && (
                              <span 
                                className={`inline-flex items-center gap-1 text-xs ${isOverdue(task.dueDate, task.completed) ? 'bg-red-500 text-white' : 'bg-blue-50 text-blue-700'}  px-2 py-1 rounded`}
                              >
                                <Calendar size={12} />
                                {formatDate(task.dueDate)}
                              </span>
                            )}
                            {task.recurring && (
                              <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">
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
                          className="px-2 py-2 hover:bg-red-200 rounded-full transition-colors"
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
        )}
      </div>
    </div>
  );
}