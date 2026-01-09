import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Page from './page'
import { useTheme } from '@/src/components/Themes/ThemeProvider'

vi.mock('@/src/components/Themes/ThemeProvider', () => ({
  useTheme: vi.fn()
}))

describe('Task Manager', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    Element.prototype.scrollIntoView = vi.fn()
    
    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      toggleTheme: vi.fn(),
      mounted: true
    })
  })

  it('should render Sidebar component', () => {
    render(<Page />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })
  
  it('should render Chat Section component by default', () => {
    render(<Page />)
    expect(screen.getByPlaceholderText(/Describe your task/)).toBeInTheDocument()
  })

  it('should render Tasks Section component', async () => {
    const user = userEvent.setup()
    render(<Page />)

    const tasksButton = screen.getByRole('button', { name: /Tasks/i })
    await user.click(tasksButton)

    await waitFor(() => {
      expect(screen.getByText(/Tasks:/)).toBeInTheDocument()
    })
  })
})