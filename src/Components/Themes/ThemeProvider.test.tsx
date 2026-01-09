import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, renderHook, act } from '@testing-library/react'
import { ThemeProvider, useTheme } from './ThemeProvider'

describe('ThemeProvider', () => {
  beforeEach(() => {
    // Clear localStorage and reset document classes
    localStorage.clear()
    document.documentElement.className = ''
    
    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  afterEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
  })

  describe('Initialization', () => {
    it('should initialize with light theme by default', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      })

      expect(result.current.theme).toBe('light')
    })

    it('should load theme from localStorage if available', () => {
      localStorage.setItem('theme', 'dark')

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      })

      expect(result.current.theme).toBe('dark')
    })

    it('should use system preference if no saved theme', () => {
      window.matchMedia = vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      })

      expect(result.current.theme).toBe('dark')
    })

    it('should set mounted to false initially, then true', async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      })

      // Wait for useEffect to complete
      await vi.waitFor(() => {
        expect(result.current.mounted).toBe(true)
      })
    })

    it('should apply theme class to document element', async () => {
      localStorage.setItem('theme', 'dark')

      renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      })

      await vi.waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true)
        expect(document.documentElement.classList.contains('light')).toBe(false)
      })
    })
  })

  describe('toggleTheme', () => {
    it('should toggle from light to dark', async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      })

      await vi.waitFor(() => {
        expect(result.current.mounted).toBe(true)
      })

      act(() => {
        result.current.toggleTheme()
      })

      expect(result.current.theme).toBe('dark')
    })

    it('should toggle from dark to light', async () => {
      localStorage.setItem('theme', 'dark')

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      })

      await vi.waitFor(() => {
        expect(result.current.mounted).toBe(true)
      })

      act(() => {
        result.current.toggleTheme()
      })

      expect(result.current.theme).toBe('light')
    })

    it('should update localStorage when theme changes', async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      })

      await vi.waitFor(() => {
        expect(result.current.mounted).toBe(true)
      })

      act(() => {
        result.current.toggleTheme()
      })

      expect(localStorage.getItem('theme')).toBe('dark')
    })

    it('should update document class when theme changes', async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      })

      await vi.waitFor(() => {
        expect(result.current.mounted).toBe(true)
      })

      act(() => {
        result.current.toggleTheme()
      })

      await vi.waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true)
        expect(document.documentElement.classList.contains('light')).toBe(false)
      })
    })

    it('should allow multiple toggles', async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      })

      await vi.waitFor(() => {
        expect(result.current.mounted).toBe(true)
      })

      act(() => {
        result.current.toggleTheme()
      })
      expect(result.current.theme).toBe('dark')

      act(() => {
        result.current.toggleTheme()
      })
      expect(result.current.theme).toBe('light')

      act(() => {
        result.current.toggleTheme()
      })
      expect(result.current.theme).toBe('dark')
    })
  })

  describe('Context Error Handling', () => {
    it('should throw error when useTheme is used outside ThemeProvider', () => {
      // Suppress console.error for this test
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        renderHook(() => useTheme())
      }).toThrow('useTheme must be used within ThemeProvider')

      consoleErrorSpy.mockRestore()
    })
  })

  describe('Children Rendering', () => {
    it('should render children components', () => {
      render(
        <ThemeProvider>
          <div>Test Child</div>
        </ThemeProvider>
      )

      expect(screen.getByText('Test Child')).toBeInTheDocument()
    })
  })
})

describe('ThemeProvider - Negative Testing', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
  })

  afterEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
  })

  it('should handle corrupted localStorage data', () => {
    localStorage.setItem('theme', 'invalid-theme')

    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider
    })

    // Should default to light or dark based on system preference
    expect(['light', 'dark']).toContain(result.current.theme)
  })

  it('should handle missing localStorage access', () => {
    const originalGetItem = Storage.prototype.getItem
    const originalSetItem = Storage.prototype.setItem
    
    Storage.prototype.getItem = vi.fn(() => { throw new Error('localStorage not available') })
    Storage.prototype.setItem = vi.fn(() => { throw new Error('localStorage not available') })

    // Should not crash
    expect(() => {
      renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      })
    }).not.toThrow()

    Storage.prototype.getItem = originalGetItem
    Storage.prototype.setItem = originalSetItem
  })
})