'use client'

import { createContext, useState, useContext, ReactNode, useEffect } from 'react'

type Theme = 'light' | 'dark'

type ThemeContextType = {
  theme: Theme 
  toggleTheme: () => void
  mounted: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme') as Theme
      if(savedTheme === 'dark' || savedTheme === 'light') {
        setTheme(savedTheme)
        localStorage.setItem('theme', savedTheme)
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        const initialTheme = prefersDark ? 'dark' : 'light'

        document.documentElement.classList.remove('light', 'dark')
        document.documentElement.classList.add(initialTheme)

        setTheme(initialTheme)
        localStorage.setItem('theme', initialTheme)
      }
    } catch(error) {
      console.warn("Couldn't get saved preference, using default light theme")
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if(mounted) {
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(theme)
      try {
        localStorage.setItem('theme', theme)
      } catch(error) {
        console.warn("Can't save theme to local storage")
      }
    }
  }, [theme, mounted])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if(!context) throw new Error('useTheme must be used within ThemeProvider')

  return context
}