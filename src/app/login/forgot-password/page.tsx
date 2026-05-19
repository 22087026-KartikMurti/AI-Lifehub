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
      <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className='flex-1 flex justify-center items-center'>
          <div className='bg-gray-50 dark:bg-gray-800 p-20 border rounded-lg'>
            <div className='w-fit'>
              <ThemeSwitcher />
            </div>
            <div className='space-y-6'>
              <div className='p-1'>
                <label className='p-1 w-fit text-gray-900 dark:text-gray-200'>Your Email:</label>
                <input
                  id='email'
                  type='text'
                  value={email}
                  className='p-2 border rounded-lg'
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className='p-1'>
                <Button
                  onClick={handleEmailSubmit}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                >Send Verification Code</Button>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                {error}
              </div>
            )}
          </div>
        </div> 
      </div>
    )
  } else if(view === 'Code') {
    return (
      <>
        <Button onClick={() => {
            setView('Email')
            setError('')
          }
        }>
          <CircleArrowLeft /> Back to Email Section
        </Button>
        <p>The verification code has been sent, please check your email and input the code below</p>
        <label>Verification Code:</label>
        <input
          id='code'
          type='text'
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <Button 
          className='hover:underline'
          onClick={handleEmailSubmit}
        >
          Resend Code
        </Button>

        <Button
          onClick={handleSubmitCode}
        >
          Submit Code
        </Button>
        
        {error && (
          <div className="text-red-500 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            {error}
          </div>
        )}
      </>
    )
  } else if(view === 'Reset') {
    return (
      <>
        <label>New Password:</label>
        <input
          id='reset'
          type='text'
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <label>Confirm New Password:</label>
        <input
          id='confirm-reset'
          type='text'
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <Button
          onClick={handlePasswordChange}
        >
          Confirm
        </Button>

        {error && (
          <div className="text-red-500 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            {error}
          </div>
        )}
      </>
    )
  }
}