'use client'

import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import Button from '@/src/components/Button'
import { aiService } from '@/src/services/aiService'
import { taskService } from '@/src/services/taskService'
import { ToastProps } from '@/src/types/toast'
import Toast from '@/src/components/Toast'

const ANIMATION_DELAYS = ['0ms', '150ms', '300ms']

export default function ChatSection() {
  const [toast, setToast] = useState<ToastProps | null>(null)
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: 'Hi! I can help you create and manage tasks. Just tell me what you need to do, and I\'ll help you organize it. Try saying something like "I need to drink water every 2 hours" or "Review project proposal by Friday".'
    }
  ])
  const [input, setInput] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

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

            if(savedTask) {
              setToast({ message: 'Task Created Successfully!', type: 'success' })
              setMessages(prev => [...prev, { role: 'assistant', content: parsed.message }])
            } else {
              setToast({ message: 'Created task returned null', type: 'error' })
              setMessages(prev => [...prev, { role: 'assistant', content: parsed.message }])
            }

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
                    : 'bg-white text-gray-800 border border-gray-200 dark:bg-gray-900 dark:text-white dark:border-none'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 dark:bg-gray-900 dark:text-white dark:border-none rounded-2xl px-4 py-3">
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
      <form className="border-t border-gray-200 dark:border-gray-600 p-4" onSubmit={handleSubmit}>
        <div className="max-w-3xl mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your task... (e.g., 'Drink water every hour' or 'Call mom tomorrow at 3pm')"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            disabled={loading}
          />
          <Button
            aria-label='Send message'
            type='submit'
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={20} />
          </Button>
        </div>
      </form>
    </>
  )
}