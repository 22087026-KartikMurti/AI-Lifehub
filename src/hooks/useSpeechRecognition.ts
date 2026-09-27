import { useState, useEffect, useRef, useCallback } from 'react'

const ERROR_MESSAGES: Record<string, string> = {
  'not-allowed': 'Microphone access denied. Pleas enable in settings.',
  'no-speech': 'No speech detected. Please try again.',
  'audio-capture': 'No microphone found',
  'network': 'Network error occurred',
}

export function useSpeechRecognition(
  onTranscript: (input: string) => void,
  onError: (error: string) => void
) {
  const [speechSupported, setSpeechSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const isManualStop = useRef(false)
  const hadFatalError = useRef(false)

  const onTranscriptRef = useRef(onTranscript)
  const onErrorRef = useRef(onError)
  useEffect(() => { onTranscriptRef.current = onTranscript }, [onTranscript])
  useEffect(() => { onErrorRef.current = onError }, [onError])

  useEffect(() => {
    if(typeof window === 'undefined') return
    
    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition
    if(!SpeechRecognitionCtor) return

    setSpeechSupported(true)

    const recognition = new SpeechRecognitionCtor()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-AU'
    recognition.maxAlternatives = 1

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((result: SpeechRecognitionResult) => result[0])
        .map((alt) => alt.transcript)
        .join('')
      
      onTranscriptRef.current(transcript)
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error: ', event.error)

      if(event.error === 'no-speech' || event.error === 'aborted') {
        return
      }

      hadFatalError.current = true
      setListening(false)

      const message = ERROR_MESSAGES[event.error] || `Unexpected error: ${event.error}`
      onErrorRef.current(message)
    }

    recognition.onend = () => {
      if(!isManualStop.current && !hadFatalError.current) {
        try {
          recognition.start()
        } catch(e) {
          console.error('Failed to restart voice input: ', e)
        }
      } else {
        setListening(false)
        isManualStop.current = false
        hadFatalError.current = false
      }
    }

    recognitionRef.current = recognition

    return () => {
      isManualStop.current = true
      recognition.stop()
    }
  }, [])

  const toggleListening = useCallback(() => {
    if(!recognitionRef.current) {
      onErrorRef.current('Speech recognition is not supported on this browser or device')
      return
    }

    // if mic on, stop listening. If mic off, start listening
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
        onErrorRef.current('Could not start voice input.')
      }
    }
  }, [listening])

  return { speechSupported, listening, toggleListening }
}