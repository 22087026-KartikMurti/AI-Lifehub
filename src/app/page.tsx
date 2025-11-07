"use client"

import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'

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
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <h1 className="font-sans">AI Prompt Test</h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4">
          <textarea 
            className="border p-2 w-80 h-32 resize-none" 
            placeholder="Enter your prompt here..." 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded"
          >
            {loading ? 'Generating...' : 'Submit'}
          </button>
        </form>

        {response && (
          <div className="mt-6 p-4 bg-gray-800 border border-gray-600 rounded-lg max-w-2xl">
            <h2 className="text-lg font-semibold text-white mb-3">AI Response:</h2>
            <div className="text-white whitespace-pre-wrap leading-relaxed">
              <ReactMarkdown
                components={{
                  code: ({node, className, children, ...props}) => {
                    const isInline = !className?.includes('language-')
                    return isInline ? (
                      <code className="bg-gray-700 px-1 py-0.5 rounded text-sm font-mono" {...props}>
                        {children}
                      </code>
                    ) : (
                      <pre className="bg-gray-900 p-3 rounded overflow-x-auto">
                        <code className="text-sm font-mono" {...props}>
                          {children}
                        </code>
                      </pre>
                    )
                  },

                  // Style headers
                  h1: ({children}) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
                  h2: ({children}) => <h2 className="text-xl font-bold mb-3">{children}</h2>,
                  h3: ({children}) => <h3 className="text-lg font-bold mb-2">{children}</h3>,
                  // Style lists
                  ul: ({children}) => <ul className="list-disc ml-6 mb-4">{children}</ul>,
                  ol: ({children}) => <ol className="list-decimal ml-6 mb-4">{children}</ol>,
                  li: ({children}) => <li className="mb-1">{children}</li>,
                  // Style paragraphs
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