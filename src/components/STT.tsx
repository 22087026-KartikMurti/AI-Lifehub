"use client"

import { useState, useEffect, useRef } from "react"
import { Mic, MicOff } from "lucide-react"
import Button from "./Button"

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
  const [speechSupported, setSpeechSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<any>(null)
  const isManualStop = useRef(false)

  useEffect(() => {
    if(typeof window !== 'undefined') {
      const speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

      if(speechRecognition) {
        setSpeechSupported(true)
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = 'en-AU'
        recognitionRef.current.maxAlternatives = 1

        recognitionRef.current.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result) => result.transcript)
            .join('')
          
          onTranscript(transcript)
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error: ', event.error)

          if(event.error === 'no-speech' || event.error === 'aborted') {
            return
          }

          setListening(false)

          const errorMessages: Record<string, string> = {
            'not-allowed': 'Microphone access denied. Pleas enable in settings.',
            'no-speech': 'No speech detected. Please try again.',
            'audio-capture': 'No microphone found',
            'network': 'Network error occurred',
          }

          const message = errorMessages[event.error] || `Unexpected error: ${event.error}`
          onError(message)
        }

        recognitionRef.current.onend = () => {
          if(listening && !isManualStop.current) {
            try {
              recognitionRef.current.start()
            } catch(e) {
              console.error('Failed to restart voice input: ', e)
            }
          } else {
            setListening(false)
            isManualStop.current = false
          }
        }
      }
    }

    return () => {
      if(recognitionRef.current) {
        isManualStop.current = true
        recognitionRef.current.stop()
      }
    }
  }, [listening, onTranscript, onError])

  const toggleListening = () => {
    if(!recognitionRef.current) {
      onError('Speech recognition is not supported on this browser or device')
      return
    }

    if(listening) {
      isManualStop.current = true
      recognitionRef.current.stop()
      setListening(false)
    } else {
      try {
        isManualStop.current = false
        recognitionRef.current.start()
        setListening(true)
      } catch(error) {
        console.error('Error starting speech recognition API: ', error)
        onError('Could not start voice input.')
      }
    }
  }

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