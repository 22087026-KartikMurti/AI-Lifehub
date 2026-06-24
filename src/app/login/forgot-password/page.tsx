'use client'

import { useState } from 'react'
import { CircleArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

import ThemeSwitcher from "@/src/components/Themes/ThemeSwitcher"
import getBaseUrl from '@/src/utils/getBaseUrl'
import Button from '@/src/components/Button'

export default function forgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [view, setView] = useState<'Email' | 'Code'| 'Reset'>('Email')
  const [error, setError] = useState('')
  const router = useRouter()
  
  const handleEmailSubmit = async () => {
    try {
      setError('')
      if(email.trim().length === 0) {
        setError('Email field can not be empty')
        return
      }

      const response = await fetch(`${getBaseUrl()}/api/auth/login/forgot-password/send-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if(response.ok) {
        setView('Code')
      } else {
        setError(data.error || 'Something went wrong. Please try again.')
      }

    } catch(e) {
      console.log('Error submitting email: ', e)
      setError('Unexpected error occurred')
    }
  }

  const handleSubmitCode = async () => {
    try {
      setError('')
      if(email.trim().length === 0) {
        setError('Email field can not be empty')
        return
      }
      if(code.trim().length === 0) {
        setError('Verification code can not be empty')
        return
      }

      const response = await fetch(`${getBaseUrl()}/api/auth/login/forgot-password/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, code })
      })

      const data = await response.json()

      if(response.ok) {
        setView('Reset')
      } else {
        setError(data.error || 'Something went wrong. Please try again.')
      }

    } catch(e) {
      console.log('Error verifying email: ', e)
      setError('Unexpected error occurred')
    }
  }

  const handlePasswordChange = async () => {
    try {
      setError('')
      if(newPassword.trim().length === 0 || newPassword !== confirmPassword) {
        setError("Password is empty or does not match")
        return
      }

      const response = await fetch(`${getBaseUrl()}/api/auth/login/forgot-password/change-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newPassword })
      })

      const data = await response.json()

      if(response.ok) {
        router.push('/login')
      } else {
        setError(data.error || 'Something went wrong. Please try again.')
      }

    } catch(e) {
      console.log('Error changing password: ', e)
      setError('Unexpected error occurred')
    }
  }

  if(view === 'Email') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-8 sm:p-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Forgot Password</h2>
            <ThemeSwitcher />
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Enter your account email and we'll send a verification code to reset your password.</p>

          <div className="space-y-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              id='email'
              type='text'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition'
              placeholder='you@example.com'
            />

            <Button
              onClick={handleEmailSubmit}
              className="w-full mt-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-sm transition"
            >Send Verification Code</Button>
          </div>

          {error && (
            <div className="mt-6 text-sm text-red-700 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-700 rounded-md p-3">
              {error}
            </div>
          )}
        </div>
      </div>
    )
  } else if(view === 'Code') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-8 sm:p-10">
          <div className="flex items-center gap-3 mb-4">
            <Button
              onClick={() => { setView('Email'); setError('') }}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
            >
              <CircleArrowLeft /> Back
            </Button>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Enter Verification Code</h3>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">We've sent a code to <span className="font-medium text-gray-800 dark:text-gray-200">{email || 'your email'}</span>. Paste it below to continue.</p>

          <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Verification Code</label>
          <input
            id='code'
            type='text'
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className='w-full mt-2 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition'
            placeholder='123456'
          />

          <div className="mt-4 flex gap-3">
            <Button onClick={handleEmailSubmit} className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-md">Resend Code</Button>
            <Button onClick={handleSubmitCode} className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md">Submit</Button>
          </div>

          {error && (
            <div className="mt-4 text-sm text-red-700 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-700 rounded-md p-3">
              {error}
            </div>
          )}
        </div>
      </div>
    )
  } else if(view === 'Reset') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-8 sm:p-10">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Set a New Password</h3>

          <label htmlFor="reset" className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
          <input
            id='reset'
            type='text'
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className='w-full mt-2 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition'
          />

          <label htmlFor="confirm-reset" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-4">Confirm New Password</label>
          <input
            id='confirm-reset'
            type='text'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className='w-full mt-2 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition'
          />

          <Button onClick={handlePasswordChange} className="w-full mt-6 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md">Confirm</Button>

          {error && (
            <div className="mt-4 text-sm text-red-700 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-700 rounded-md p-3">
              {error}
            </div>
          )}
        </div>
      </div>
    )
  }
}