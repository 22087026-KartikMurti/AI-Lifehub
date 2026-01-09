import { describe, it, vi, expect, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ThemeSwitcher from './ThemeSwitcher'
import { useTheme } from '@/src/components/Themes/ThemeProvider'

vi.mock('@/src/components/Themes/ThemeProvider', () => ({
  useTheme: vi.fn()
}))

describe('Theme Switcher', () => {
  const mockToggleTheme = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render Moon icon when theme is light', () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      toggleTheme: mockToggleTheme,
      mounted: true
    })

    render(<ThemeSwitcher />)

    expect(screen.getByLabelText('Moon symbol')).toBeInTheDocument()
    expect(screen.queryByLabelText('Sun symbol')).not.toBeInTheDocument()
  })

  it('should render Sun icon when theme is dark', () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: 'dark',
      toggleTheme: mockToggleTheme,
      mounted: true
    })

    render(<ThemeSwitcher />)

    expect(screen.getByLabelText('Sun symbol')).toBeInTheDocument()
    expect(screen.queryByLabelText('Moon symbol')).not.toBeInTheDocument()
  })

  it('should call toggleTheme when button is clicked', async () => {
    const user = userEvent.setup()

    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      toggleTheme: mockToggleTheme,
      mounted: true
    })

    render(<ThemeSwitcher />)

    const button = screen.getByRole('button')
    await user.click(button)

    expect(mockToggleTheme).toHaveBeenCalledTimes(1)
  })
})