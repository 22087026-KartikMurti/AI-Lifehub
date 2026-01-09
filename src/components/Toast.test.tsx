import { describe, it, vi, expect, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Toast from './Toast'

describe('Toast Component', () => {
  const mockOnClose = vi.fn()
  const mockOnRestore = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render toast with message', () => {
      render(
        <Toast
          message="Test message"
          type="success"
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('Test message')).toBeInTheDocument()
    })

    it('should render Close button', () => {
      render(
        <Toast
          message="Test message"
          type="success"
          onClose={mockOnClose}
        />
      )

      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
    })

    it('should render Undo button when undo is true and onRestore provided', () => {
      render(
        <Toast
          message="Test message"
          type="success"
          undo={true}
          onClose={mockOnClose}
          onRestore={mockOnRestore}
        />
      )

      expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument()
    })

    it('should not render Undo button when undo is false', () => {
      render(
        <Toast
          message="Test message"
          type="success"
          undo={false}
          onClose={mockOnClose}
          onRestore={mockOnRestore}
        />
      )

      expect(screen.queryByRole('button', { name: 'Undo' })).not.toBeInTheDocument()
    })

    it('should not render Undo button when onRestore is not provided', () => {
      render(
        <Toast
          message="Test message"
          type="success"
          undo={true}
          onClose={mockOnClose}
        />
      )

      expect(screen.queryByRole('button', { name: 'Undo' })).not.toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('should apply success styles', () => {
      const { container } = render(
        <Toast
          message="Success message"
          type="success"
          onClose={mockOnClose}
        />
      )

      const toast = container.firstChild
      expect(toast).toHaveClass('bg-green-500')
    })

    it('should apply error styles', () => {
      const { container } = render(
        <Toast
          message="Error message"
          type="error"
          onClose={mockOnClose}
        />
      )

      const toast = container.firstChild
      expect(toast).toHaveClass('bg-red-500')
    })

    it('should have progress bar with success color', () => {
      const { container } = render(
        <Toast
          message="Success message"
          type="success"
          onClose={mockOnClose}
        />
      )

      const progressBar = container.querySelector('.bg-green-400')
      expect(progressBar).toBeInTheDocument()
    })

    it('should have progress bar with error color', () => {
      const { container } = render(
        <Toast
          message="Error message"
          type="error"
          onClose={mockOnClose}
        />
      )

      const progressBar = container.querySelector('.bg-red-400')
      expect(progressBar).toBeInTheDocument()
    })

    it('should have fixed positioning and animation classes', () => {
      const { container } = render(
        <Toast
          message="Test message"
          type="success"
          onClose={mockOnClose}
        />
      )

      const toast = container.firstChild
      expect(toast).toHaveClass('fixed', 'top-4', 'right-4', 'animate-slide-in')
    })
  })

  describe('Auto-dismiss Timer', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.runOnlyPendingTimers()
      vi.useRealTimers()
    })

    it('should call onClose after 3 seconds', () => {
      render(
        <Toast
          message="Test message"
          type="success"
          onClose={mockOnClose}
        />
      )

      expect(mockOnClose).not.toHaveBeenCalled()

      vi.advanceTimersByTime(3000)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should not call onClose before 3 seconds', () => {
      render(
        <Toast
          message="Test message"
          type="success"
          onClose={mockOnClose}
        />
      )

      vi.advanceTimersByTime(2999)

      expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('should clean up timer on unmount', () => {
      const { unmount } = render(
        <Toast
          message="Test message"
          type="success"
          onClose={mockOnClose}
        />
      )

      unmount()
      vi.advanceTimersByTime(3000)

      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })

  describe('User Interactions without Fake Timer', () => {
    const mockOnClose = vi.fn()
    const mockOnRestore = vi.fn()

    it('should call onClose when Close button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <Toast
          message="Test message"
          type="success"
          onClose={mockOnClose}
        />
      )
      
      const closeButton = screen.getByRole('button', { name: 'Close' })
      await user.click(closeButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should call onRestore when Undo button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <Toast
          message="Test message"
          type="success"
          undo={true}
          onClose={mockOnClose}
          onRestore={mockOnRestore}
        />
      )

      const undoButton = screen.getByRole('button', { name: 'Undo' })
      await user.click(undoButton)

      expect(mockOnRestore).toHaveBeenCalledTimes(1)
    })

    it('should not call onClose when Undo button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <Toast
          message="Test message"
          type="success"
          undo={true}
          onClose={mockOnClose}
          onRestore={mockOnRestore}
        />
      )

      const undoButton = screen.getByRole('button', { name: 'Undo' })
      await user.click(undoButton)

      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })
})

describe('Toast Component - Negative Testing', () => {
  it('should handle empty message', () => {
    render(
      <Toast
        message=""
        type="success"
      />
    )

    // Should still render structure
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
  })

  it('should handle invalid type gracefully', () => {
    render(
      <Toast
        message="Test message"
        type={'invalid' as any}
      />
    )

    // Should still render without crashing
    expect(screen.getByText('Test message')).toBeInTheDocument()
  })
})