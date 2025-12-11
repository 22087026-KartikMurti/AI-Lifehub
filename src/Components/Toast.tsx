import { useEffect } from 'react'
import Button from './Button'

type ToastProps = {
  message: string
  type: 'success' | 'error'
  undo?: boolean
  onClose: () => void
  onRestore?: () => void
}

export default function Toast({ message, type, undo, onClose, onRestore }: ToastProps) {
  const styles = {
    success: 'bg-green-500',
    error: 'bg-red-500'
  }

  const progressStyles = {
    success: 'bg-green-400',
    error: 'bg-red-400'
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div 
      className={`fixed top-4 right-4 ${styles[type]} rounded-lg shadow-lg animate-slide-in overflow-hidden z-50`}
    >
      {/* Progress Bar */}
      <div
        className={`absolute inset-0 ${progressStyles[type]} animate-progress`}
      />

      {/* Content */}
      <div className={`relative text-white px-4 py-3 flex items-center z-10`}>
        {message}
        <Button 
          className='opacity-80 ml-2 hover:opacity-40 px-4 py-1 rounded-lg' 
          onClick={onClose} 
        >
          Close
        </Button>
        {undo && onRestore && (
          <Button 
            className='opacity-80 ml-2 hover:opacity-40 px-4 py-1 rounded-lg' 
            onClick={onRestore} 
          >
            Undo
          </Button>
        )}
      </div>
    </div>
  )
}