"use client"

/*
 * TODO: 
 * 
 * 1. API for logging in (api/auth/login)
 * 
*/
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import getBaseUrl from '@/src/utils/getBaseUrl'
import Button from '@/src/components/Button'

export default function SignupPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [checkPassword, setCheckPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if(password !== checkPassword) {
      setError('Password need to match')
      return 
    }
    setLoading(true)

    try {
      const response = await fetch(`${getBaseUrl()}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, firstName, lastName, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // Try to automatcially log user in
        try {
          const res = await fetch(`${getBaseUrl()}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password})
          })

          const loginData = await res.json() 

          if(res.ok) {
            router.push('/task-manager')
          } else {
            setError(loginData.error || 'Trouble logging in')
          }
        } catch(error) {
          setError('Account created however there was trouble logging in')
          console.log('login error: ', error)
        }
      } else {
        setError(data.error || 'Sign up failed')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.log('Unexpected error: ', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      {/* Navigation Bar */}
      <nav className="w-full p-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-white hover:text-gray-300 transition-colors">
          AI LifeHub
        </Link>
      </nav>

      {/* Login Form */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">Welcome</h2>
            <p className="mt-2 text-gray-400">Sign up for your account</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Create a username"
              />

              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email address"
              />

              <label htmlFor="first-name" className="block text-sm font-medium text-gray-300 mb-2">
                First Name
              </label>
              <input
                id="first-name"
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your first name"
              />

              <label htmlFor="last-name" className="block text-sm font-medium text-gray-300 mb-2">
                Last Name
              </label>
              <input
                id="last-name"
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your last name"
              />

              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Create password"
              />

              <label htmlFor="check-password" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                id="check-password"
                type="password"
                required
                value={checkPassword}
                onChange={(e) => setCheckPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Confirm password"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              {loading ? 'Signing up...' : 'Sign Up'}
            </Button>
          </form>

          <p className="mb-10 text-center text-gray-400">
            Have an account? <Link href="/login" className="text-blue-500 hover:text-blue-400">Log In</Link>
          </p>
        </div>
      </main>
    </div>
  )
}