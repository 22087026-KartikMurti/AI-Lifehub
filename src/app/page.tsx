"use client"

import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import Link from 'next/link'

export default function Home() {
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if(!prompt.trim()) return;

    setLoading(true)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        
        body: JSON.stringify({ prompt })
      })

      const data = await res.json()

      if(res.ok) {
        setResponse(data.response)
      } else {
        setResponse('Error: ' + data.error)
      }
    } catch(error) {
      setResponse('Error: Failed to connect to AI')
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    "Add a task: Finish project proposal",
    "Track habit: Drank 8 glasses of water today",
    "Schedule meeting with team tomorrow at 2pm",
    "Show me my tasks for today"
  ]

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen space-y-6 p-4 bg-gray-900">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">AI LifeHub</h1>
          <p className="text-gray-300">Your AI-powered productivity assistant</p>
        </div>

        <div className='hover:text-gray-800 bg-purple-600 hover:bg-purple-400 rounded p-4'>
          <Link href="/task-manager">Click here for the Task Manager!</Link>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4 w-full max-w-2xl">
          <textarea 
            className="border border-gray-600 p-4 w-full h-32 resize-none rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white placeholder-gray-400" 
            placeholder="What would you like to do today? (e.g., 'Add a task', 'Track a habit', 'Schedule a meeting')" 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            {loading ? 'Processing...' : 'Send Message'}
          </button>
        </form>

        {/* Quick Action Buttons */}
        <div className="w-full max-w-2xl">
          <p className="text-sm text-gray-400 mb-3">Try these examples:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => setPrompt(action)}
                className="text-left p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors text-gray-300"
                disabled={loading}
              >
                {action}
              </button>
            ))}
          </div>
        </div>

        {response && (
          <div className="mt-6 p-4 bg-gray-800 border border-gray-700 rounded-lg max-w-2xl w-full">
            <h2 className="text-lg font-semibold text-white mb-3">AI Assistant:</h2>
            <div className="text-gray-300 leading-relaxed">
              <ReactMarkdown
                components={{
                  code: ({node, className, children, ...props}) => {
                    const isInline = !className?.includes('language-')
                    return isInline ? (
                      <code className="bg-gray-700 px-1 py-0.5 rounded text-sm font-mono text-gray-200" {...props}>
                        {children}
                      </code>
                    ) : (
                      <pre className="bg-gray-900 text-gray-200 p-3 rounded overflow-x-auto">
                        <code className="text-sm font-mono" {...props}>
                          {children}
                        </code>
                      </pre>
                    )
                  },
                  h1: ({children}) => <h1 className="text-2xl font-bold mb-4 text-white">{children}</h1>,
                  h2: ({children}) => <h2 className="text-xl font-bold mb-3 text-white">{children}</h2>,
                  h3: ({children}) => <h3 className="text-lg font-bold mb-2 text-white">{children}</h3>,
                  ul: ({children}) => <ul className="list-disc ml-6 mb-4">{children}</ul>,
                  ol: ({children}) => <ol className="list-decimal ml-6 mb-4">{children}</ol>,
                  li: ({children}) => <li className="mb-1">{children}</li>,
                  p: ({children}) => <p className="mb-4">{children}</p>,
              }}>
                {response}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </>
  )
}