import { describe, it, vi, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TaskPage from './Task'
import { Task } from '@/src/types/task'

vi.mock('@/src/utils/isOverdue', () => ({
  default: vi.fn((dueDate, completed) => {
    if(completed) return false
    if(!dueDate) return false
    return new Date(dueDate) < new Date()
  })
}))

vi.mock('@/src/utils/formatDate', () => ({
  default: vi.fn((dateStr) => {
    if(!dateStr) return ''
    return new Date(dateStr).toLocaleDateString()
  })
}))

vi.mock('@/src/utils/getPriorityColour', () => {
  type priorities = {
    low: string,
    medium: string,
    high: string
  }
  return {
    default: vi.fn((priority: keyof priorities) => {
      const colors = {
        low: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
        medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-50',
        high: 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-50'
      }
      return colors[priority] || ''
    })
  }
})

describe('Task Page', () => {
  const testDate = new Date(Date.now()).toISOString()
  const baseTask: Task = {
    id: '1',
    title: 'Basic Title',
    description: 'Basic description',
    priority: 'medium',
    completed: false,
    recurring: true,
    recurringInterval: 'daily',
    createdAt: testDate
  }

  const mockOnToggle = vi.fn()
  const mockOnDelete = vi.fn()
  const mockOnOpenModal = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render task with title and description', () => {
      render(
        <TaskPage
          task={baseTask}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onOpenModal={mockOnOpenModal}
        />
      )

      expect(screen.getByText('Basic Title')).toBeInTheDocument()
      expect(screen.getByText('Basic description')).toBeInTheDocument()
    })

    it('should render task without description', () => {
      const taskWithoutDesc = { ...baseTask, description: undefined }
      
      render(
        <TaskPage
          task={taskWithoutDesc}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onOpenModal={mockOnOpenModal}
        />
      )

      expect(screen.getByText('Basic Title')).toBeInTheDocument()
      expect(screen.queryByText('Basic description')).not.toBeInTheDocument()
    })

    it('should render priority badge', () => {
      render(
        <TaskPage
          task={baseTask}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onOpenModal={mockOnOpenModal}
        />
      )

      expect(screen.getByText('medium')).toBeInTheDocument()
    })

    it('should render due date when present', () => {
      const taskWithDueDate = { 
        ...baseTask, 
        dueDate: '2026-12-31T00:00:00.000Z' 
      }

      render(
        <TaskPage
          task={taskWithDueDate}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onOpenModal={mockOnOpenModal}
        />
      )

      expect(screen.getByText('31/12/2026')).toBeInTheDocument()
    })

    it('should render recurring interval when task is recurring', () => {
      render(
        <TaskPage
          task={baseTask}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onOpenModal={mockOnOpenModal}
        />
      )

      expect(screen.getByText('daily')).toBeInTheDocument()
    })

    it('should not render recurring interval when task is not recurring', () => {
      const notRecurringTask = {
        ...baseTask,
        recurring: false
      }
      render(
        <TaskPage
          task={notRecurringTask}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onOpenModal={mockOnOpenModal}
        />
      )

      expect(screen.queryByText('daily')).not.toBeInTheDocument()
    })
  })

  describe('Task Completion', () => {
    it('should show checkmark when task is completed', () => {
      const completedTask = { ...baseTask, completed: true }

      render(
        <TaskPage
          task={completedTask}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onOpenModal={mockOnOpenModal}
        />
      )

      const checkbox = screen.getAllByRole('button')[0]
      const checkIcon = checkbox.querySelector('svg')
      expect(checkIcon).toBeInTheDocument()
    })

    it('should apply completed styles when task is completed', () => {
      const completedTask = { ...baseTask, completed: true }

      render(
        <TaskPage
          task={completedTask}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onOpenModal={mockOnOpenModal}
        />
      )

      const title = screen.getByText('Basic Title')
      expect(title).toHaveClass('line-through')
    })

    it('should not show checkmark when task is not completed', () => {
      render(
        <TaskPage
          task={baseTask}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onOpenModal={mockOnOpenModal}
        />
      )

      const checkbox = screen.getAllByRole('button')[0]
      const checkIcon = checkbox.querySelector('svg')
      expect(checkIcon).not.toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('should call onToggle when checkbox is clicked', async () => {
      const user = userEvent.setup()
      render(
        <TaskPage
          task={baseTask}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onOpenModal={mockOnOpenModal}
        />
      )

      const checkbox = screen.getByRole('button', { name: 'Toggle task completion' })
      await user.click(checkbox)

      expect(mockOnToggle).toHaveBeenCalledWith('1')
      expect(mockOnToggle).toHaveBeenCalledTimes(1)
    })

    it('should call onDelete when delete button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <TaskPage
          task={baseTask}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onOpenModal={mockOnOpenModal}
        />
      )

      const deleteButton = screen.getByRole('button', { name: 'Delete task' })
      
      await user.click(deleteButton)

      expect(mockOnDelete).toHaveBeenCalledWith('1')
      expect(mockOnDelete).toHaveBeenCalledTimes(1)
    })

    it('should call onOpenModal when edit button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <TaskPage
          task={baseTask}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onOpenModal={mockOnOpenModal}
        />
      )

      const editButton = screen.getByRole('button', { name: 'Edit task' })
      await user.click(editButton)

      expect(mockOnOpenModal).toHaveBeenCalledWith(baseTask)
      expect(mockOnOpenModal).toHaveBeenCalledTimes(1)
    })
  })

  describe('Text Truncation', () => {
    it('should truncate long titles', () => {
      const longTitleTask = {
        ...baseTask,
        title: 'This is a very long title that should be truncated after 40 characters'
      }

      render(
        <TaskPage
          task={longTitleTask}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onOpenModal={mockOnOpenModal}
        />
      )

      expect(screen.getByText(/This is a very long title that should be.../)).toBeInTheDocument()
    })

    it('should truncate long descriptions', () => {
      const longDescTask = {
        ...baseTask,
        description: 'This is a very long description that should be truncated after fifty characters maximum'
      }

      render(
        <TaskPage
          task={longDescTask}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onOpenModal={mockOnOpenModal}
        />
      )

      expect(screen.getByText(/This is a very long description that should be tr.../)).toBeInTheDocument()
    })

    it('should not truncate short titles', () => {
      const shortTitleTask = {
        ...baseTask,
        title: 'Short'
      }

      render(
        <TaskPage
          task={shortTitleTask}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onOpenModal={mockOnOpenModal}
        />
      )

      const title = screen.getByText('Short')
      expect(title).toBeInTheDocument()
      expect(title.textContent).not.toMatch(/\.\.\./)
    })

    it('should not truncate short descriptions', () => {
      const shortDescTask = {
        ...baseTask,
        description: 'Short desc'
      }

      render(
        <TaskPage
          task={shortDescTask}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onOpenModal={mockOnOpenModal}
        />
      )

      const description = screen.getByText('Short desc')
      expect(description).toBeInTheDocument()
      expect(description.textContent).not.toMatch(/\.\.\./)
    })
  })

  describe('Priority Styles', () => {
    it('should apply correct styles for high priority', () => {
      const highPriorityTask = { ...baseTask, priority: 'high' as const }

      render(
        <TaskPage
          task={highPriorityTask}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onOpenModal={mockOnOpenModal}
        />
      )

      const priorityBadge = screen.getByText('high')
      expect(priorityBadge).toHaveClass('bg-red-100', 'text-red-800')
    })

    it('should apply correct styles for medium priority', () => {
      const medPriorityTask = { ...baseTask, priority: 'medium' as const }

      render(
        <TaskPage
          task={medPriorityTask}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onOpenModal={mockOnOpenModal}
        />
      )

      const priorityBadge = screen.getByText('medium')
      expect(priorityBadge).toHaveClass('bg-yellow-100', 'text-yellow-800')
    })

    it('should apply correct styles for low priority', () => {
      const lowPriorityTask = { ...baseTask, priority: 'low' as const }

      render(
        <TaskPage
          task={lowPriorityTask}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onOpenModal={mockOnOpenModal}
        />
      )

      const priorityBadge = screen.getByText('low')
      expect(priorityBadge).toHaveClass('bg-green-100', 'text-green-800')
    })
  })

  describe('Overdue Tasks', () => {
    it('should apply overdue styles when task is overdue', () => {
      const overdueTask = {
        ...baseTask,
        dueDate: '2020-01-01T00:00:00.000Z',
        completed: false
      }

      const { container } = render(
        <TaskPage
          task={overdueTask}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onOpenModal={mockOnOpenModal}
        />
      )

      const taskCard = container.firstChild
      expect(taskCard).toHaveClass('bg-red-50', 'border-red-300')
    })

    it('should not apply overdue styles when task is completed', () => {
      const completedOverdueTask = {
        ...baseTask,
        dueDate: '2020-01-01T00:00:00.000Z',
        completed: true
      }

      const { container } = render(
        <TaskPage
          task={completedOverdueTask}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onOpenModal={mockOnOpenModal}
        />
      )

      const taskCard = container.firstChild
      expect(taskCard).not.toHaveClass('bg-red-50', 'border-red-300')
    })
  })
})

describe('Task Component - Negative Testing', () => {
  const mockOnToggle = vi.fn()
  const mockOnDelete = vi.fn()
  const mockOnOpenModal = vi.fn()

  const baseTask: Task = {
    id: '1',
    title: 'Basic Title',
    priority: 'medium',
    completed: false,
    recurring: true,
    recurringInterval: 'daily',
    createdAt: new Date().toISOString()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should handle empty title gracefully', () => {
    const emptyTitleTask = { ...baseTask, title: '' }

    render(
      <TaskPage
        task={emptyTitleTask}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onOpenModal={mockOnOpenModal}
      />
    )

    // Should still render without crashing
    expect(screen.getAllByRole('button')).toHaveLength(3)
  })

  it('should handle missing due date', () => {
    render(
      <TaskPage
        task={baseTask}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onOpenModal={mockOnOpenModal}
      />
    )

    // Calendar icon should not be present
    expect(screen.queryByText(/\//)).not.toBeInTheDocument()
  })

  it('should handle recurring task without interval', () => {
    const recurringNoInterval = {
      ...baseTask,
      recurringInterval: undefined
    }

    render(
      <TaskPage
        task={recurringNoInterval}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onOpenModal={mockOnOpenModal}
      />
    )

    // Should not show Clock icon or interval text
    expect(screen.queryByText('daily')).not.toBeInTheDocument()
  })
})