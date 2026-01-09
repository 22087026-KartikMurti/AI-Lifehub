import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChatSection from './ChatSection'
import { aiService } from '@/src/services/aiService'
import { taskService } from '@/src/services/taskService'

vi.mock('@/src/services/aiService')
vi.mock('@/src/services/taskService')

describe('Chat Section', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    Element.prototype.scrollIntoView = vi.fn()
  })

  describe('Initial Rendering', () => {
    it('should render welcome message', () => {
      render(<ChatSection />)

      expect(screen.getByText(/Hi! I can help you create and manage tasks/)).toBeInTheDocument()
    })

    it('should render input field and submit button', () => {
      render(<ChatSection />)

      expect(screen.getByPlaceholderText(/Describe your task/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Send message' })).toBeInTheDocument()
    })

    it('should have submit button disabled when input is empty', () => {
      render(<ChatSection />)

      const submitButton = screen.getByRole('button', { name: 'Send message' })
      expect(submitButton).toBeDisabled()
    })
  })

  describe('User Input', () => {
    it('should enable submit button when input has text', async () => {
      const user = userEvent.setup()
      render(<ChatSection />)

      const input = screen.getByPlaceholderText(/Describe your task/)
      await user.type(input, 'Test task')

      const submitButton = screen.getByRole('button', { name: 'Send message' })
      expect(submitButton).not.toBeDisabled()
    })

    it('should update input value as user types', async () => {
      const user = userEvent.setup()
      render(<ChatSection />)

      const input = screen.getByPlaceholderText(/Describe your task/) as HTMLInputElement
      await user.type(input, 'Drink water')

      expect(input.value).toBe('Drink water')
    })

    it('should not submit empty input', async () => {
      const user = userEvent.setup()
      render(<ChatSection />)

      const button = screen.getByRole('button', { name: 'Send message' })
      await user.click(button)

      expect(vi.mocked(aiService.processPrompt)).not.toHaveBeenCalled()
    })
  })

  describe('Message Submission', () => {
    it('should display user message after submission', async () => {
      const user = userEvent.setup()
      vi.mocked(aiService.processPrompt).mockResolvedValue(JSON.stringify({
        action: 'conversation',
        message: 'AI response'
      }))

      render(<ChatSection />)

      const input = screen.getByPlaceholderText(/Describe your task/)
      await user.type(input, 'Test message')
      await user.click(screen.getByRole('button', { name: 'Send message' }))

      await waitFor(() => {
        expect(screen.getByText('Test message')).toBeInTheDocument()
      })
    })

    it('should clear input after submission', async () => {
      const user = userEvent.setup()
      vi.mocked(aiService.processPrompt).mockResolvedValue(JSON.stringify({
        action: 'conversation',
        message: 'AI response'
      }))

      render(<ChatSection />)

      const input = screen.getByPlaceholderText(/Describe your task/) as HTMLInputElement
      await user.type(input, 'Test message')
      await user.click(screen.getByRole('button', { name: 'Send message' }))

      await waitFor(() => {
        expect(input.value).toBe('')
      })
    })

    it('should show loading indicator while processing', async () => {
      const user = userEvent.setup()
      vi.mocked(aiService.processPrompt).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(JSON.stringify({
          action: 'conversation',
          message: 'AI response'
        })), 100))
      )

      render(<ChatSection />)

      const input = screen.getByPlaceholderText(/Describe your task/)
      await user.type(input, 'Test message')
      await user.click(screen.getByRole('button', { name: 'Send message' }))

      // Check for loading dots
      await waitFor(() => {
        const dots = document.querySelectorAll('.animate-bounce')
        expect(dots.length).toBe(3)
      })
    })

    it('should disable input and button while loading', async () => {
      const user = userEvent.setup()
      vi.mocked(aiService.processPrompt).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(JSON.stringify({
          action: 'conversation',
          message: 'AI response'
        })), 100))
      )

      render(<ChatSection />)

      const input = screen.getByPlaceholderText(/Describe your task/)
      const submitButton = screen.getByRole('button', { name: 'Send message' })
      
      await user.type(input, 'Test message')
      await user.click(submitButton)

      expect(input).toBeDisabled()
      expect(submitButton).toBeDisabled()
    })
  })

  describe('AI Conversation Response', () => {
    it('should display AI conversation response', async () => {
      const user = userEvent.setup()
      vi.mocked(aiService.processPrompt).mockResolvedValue(JSON.stringify({
        action: 'conversation',
        message: 'How can I help you today?'
      }))

      render(<ChatSection />)

      const input = screen.getByPlaceholderText(/Describe your task/)
      await user.type(input, 'Hello')
      await user.click(screen.getByRole('button', { name: 'Send message' }))

      await waitFor(() => {
        expect(screen.getByText('How can I help you today?')).toBeInTheDocument()
      })
    })
  })

  describe('Task Creation Flow', () => {
    it('should create task and show success toast', async () => {
      const user = userEvent.setup()
      const mockTask = {
        id: '1',
        title: 'Drink water',
        priority: 'medium' as const,
        completed: false,
        recurring: true,
        recurringInterval: 'hourly',
        createdAt: new Date().toISOString()
      }

      vi.mocked(aiService.processPrompt).mockResolvedValue(JSON.stringify({
        action: 'create_task',
        task: mockTask,
        message: 'Task created successfully!'
      }))
      vi.mocked(taskService.createTask).mockResolvedValue(mockTask)

      render(<ChatSection />)

      const input = screen.getByPlaceholderText(/Describe your task/)
      await user.type(input, 'Drink water every hour')
      await user.click(screen.getByRole('button', { name: 'Send message' }))

      await waitFor(() => {
        expect(screen.getByText('Task Created Successfully!')).toBeInTheDocument()
        expect(screen.getByText('Task created successfully!')).toBeInTheDocument()
      })
    })

    it('should handle task creation when savedTask is null', async () => {
      const user = userEvent.setup()
      vi.mocked(aiService.processPrompt).mockResolvedValue(JSON.stringify({
        action: 'create_task',
        task: { title: 'Test' },
        message: 'Creating task...'
      }))
      vi.mocked(taskService.createTask).mockResolvedValue(null)

      render(<ChatSection />)

      const input = screen.getByPlaceholderText(/Describe your task/)
      await user.type(input, 'Test task')
      await user.click(screen.getByRole('button', { name: 'Send message'  }))

      await waitFor(() => {
        expect(screen.getByText('Created task returned null')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle AI service error', async () => {
      const user = userEvent.setup()
      vi.mocked(aiService.processPrompt).mockRejectedValue(new Error('Network error'))

      render(<ChatSection />)

      const input = screen.getByPlaceholderText(/Describe your task/)
      await user.type(input, 'Test message')
      await user.click(screen.getByRole('button', { name: 'Send message' }))

      await waitFor(() => {
        const errMessages = screen.getAllByText(/Sorry, I encountered an error/)
        expect(errMessages.length).toBeGreaterThan(0)
      })
    })

    it('should handle JSON parsing error', async () => {
      const user = userEvent.setup()
      vi.mocked(aiService.processPrompt).mockResolvedValue('Invalid JSON')

      render(<ChatSection />)

      const input = screen.getByPlaceholderText(/Describe your task/)
      await user.type(input, 'Test message')
      await user.click(screen.getByRole('button', { name: 'Send message' }))

      await waitFor(() => {
        const errMessages = screen.getAllByText(/There was an error with the response/)
        expect(errMessages.length).toBeGreaterThan(0)
      })
    })

    it('should handle task creation error', async () => {
      const user = userEvent.setup()
      vi.mocked(aiService.processPrompt).mockResolvedValue(JSON.stringify({
        action: 'create_task',
        task: { title: 'Test' },
        message: 'Creating task...'
      }))
      vi.mocked(taskService.createTask).mockRejectedValue(new Error('Database error'))

      render(<ChatSection />)

      const input = screen.getByPlaceholderText(/Describe your task/)
      await user.type(input, 'Test task')
      await user.click(screen.getByRole('button', { name: 'Send message' }))

      await waitFor(() => {
        const errMessages = screen.getAllByText(/There was an error creating the task in the database/)
        expect(errMessages.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Toast Management', () => {
    it('should close toast when onClose is called', async () => {
      const user = userEvent.setup()
      vi.mocked(aiService.processPrompt).mockResolvedValue(JSON.stringify({
        action: 'create_task',
        task: { title: 'Test' },
        message: 'Task created'
      }))
      vi.mocked(taskService.createTask).mockResolvedValue({ id: '1', title: 'Test' } as any)

      render(<ChatSection />)

      const input = screen.getByPlaceholderText(/Describe your task/)
      await user.type(input, 'Test task')
      await user.click(screen.getByRole('button', { name: 'Send message' }))

      await waitFor(() => {
        expect(screen.getByText('Task Created Successfully!')).toBeInTheDocument()
      })

      const closeButton = screen.getByRole('button', { name: 'Close' })
      await user.click(closeButton)

      await waitFor(() => {
        expect(screen.queryByText('Task Created Successfully!')).not.toBeInTheDocument()
      })
    })
  })
})