"use client"

import { Mic, MicOff } from "lucide-react"
import Button from "./Button"
import { useSpeechRecognition } from "@/src/hooks/useSpeechRecognition"

export default function SpeechToText({
  onTranscript,
  onError,
  disabled,
  className
}: {
  onTranscript: (input: string) => void
  onError: (error: string) => void
  disabled?: boolean
  className?: string
}) {
  
  const { speechSupported, listening, toggleListening } = useSpeechRecognition(
    onTranscript,
    onError
  )    

  if(!speechSupported) {
    return null
  }

  return (
    <Button 
      aria-label={listening ? 'Stop voice input' : 'Start voice input'}
      type="button"
      onClick={toggleListening}
      disabled={disabled}
      className={`${
        listening
          ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500'
        } ${className}`}
    >
      {listening ? <MicOff size={20} /> : <Mic size={20} />}
    </Button>
  )
}