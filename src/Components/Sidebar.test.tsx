import { describe, it, vi, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Sidebar } from './Sidebar'
import { View } from '@/src/types/view'

vi.mock('@/src/components/Themes/ThemeSwitcher', () => ({
  default: () => <div data-testid='theme-switcher'>Theme Switcher</div>
}))

describe('Sidebar', () => {
  const mockOnViewChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render sidebar with the title', () => {
    render(<Sidebar view='chat' onViewChange={mockOnViewChange} />)

    expect(screen.getByText('Task Manager')).toBeInTheDocument()
    expect(screen.getByTestId('theme-switcher')).toBeInTheDocument()
  })

  it('should render Chat and Tasks buttons', () => {
    render(<Sidebar view='chat' onViewChange={mockOnViewChange} />)

    expect(screen.getByRole('button', { name: /Chat/i }))
    expect(screen.getByRole('button', { name: /Tasks/i }))
  })

  describe('Highlight nav buttons accordingly based on if selected or not', () => {
    it('should highlight Chat button when view is chat', async () => {
      render(<Sidebar view='chat' onViewChange={mockOnViewChange} />)

      const chatButton = screen.getByRole('button', { name: /Chat/i })
      const tasksButton = screen.getByRole('button', { name: /Tasks/i })

      expect(chatButton).toHaveClass('bg-blue-500', 'text-gray-50')
      expect(tasksButton).toHaveClass('text-blue-600')
    })

    it('should highlight Tasks button when view is tasks', async () => {
      render(<Sidebar view='tasks' onViewChange={mockOnViewChange} />)

      const chatButton = screen.getByRole('button', { name: /Chat/i })
      const tasksButton = screen.getByRole('button', { name: /Tasks/i })

      expect(chatButton).toHaveClass('text-blue-600')
      expect(tasksButton).toHaveClass('bg-blue-500', 'text-gray-50')
    })
  })

  describe('Checking onViewChange calls', () => {
    it('should call onViewChange with "chat" when Chat button clicked', async () => {
      const user = userEvent.setup()
      render(<Sidebar view='tasks' onViewChange={mockOnViewChange} />)

      const chatButton = screen.getByRole('button', { name: /Chat/i })
      await user.click(chatButton)

      expect(mockOnViewChange).toHaveBeenCalledWith('chat')
      expect(mockOnViewChange).toHaveBeenCalledTimes(1)
    })
    it('should call onViewChange with "tasks" when Tasks button clicked', async () => {
      const user = userEvent.setup()
      render(<Sidebar view='chat' onViewChange={mockOnViewChange} />)

      const tasksButton = screen.getByRole('button', { name: /Tasks/i })
      await user.click(tasksButton)

      expect(mockOnViewChange).toHaveBeenCalledWith('tasks')
      expect(mockOnViewChange).toHaveBeenCalledTimes(1)
    })
  })
})

describe('Sidebar - Negative Testing', () => {
  const mockOnViewChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  it('should not break with invalid view', async () => {
    render(<Sidebar view={'invalid' as View} onViewChange={mockOnViewChange} />)
    
    // renders without crashing
    expect(screen.getByText('Task Manager')).toBeInTheDocument()
  })

  it('should not break with invalid onViewChange', async () => {
    render(<Sidebar view='chat' onViewChange={null as any} />)

    // renders without crashing
    expect(screen.getByRole('button', { name: /Chat/i })).toBeInTheDocument()

  })
})