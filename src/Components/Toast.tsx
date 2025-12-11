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
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white'
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div 
      className={
        `fixed top-4 right-4 ${styles[type]} px-4 py-3 rounded-lg shadow-lg 
        flex items-center animate-slide-in z-50`
      }
    >
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
  )
}