import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EditTask from './EditTask'
import { Task } from '@/src/types/task'

describe('Edit Task', () => {
  const testDate = new Date(Date.now()).toISOString()
  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    priority: 'low',
    completed: false,
    recurring: false,
    dueDate: testDate,
    createdAt: testDate
  }

  const mockOnSave = vi.fn()
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render modal with task data', () => {
    render(<EditTask task={mockTask} onSave={mockOnSave} onClose={mockOnClose} />)

    expect(screen.getByText('Edit Task')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Low')).toBeInTheDocument()
    expect(screen.getByDisplayValue(testDate.split('T')[0])).toBeInTheDocument()
    expect(screen.getByText('Recurring Task')).toBeInTheDocument()
  })

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<EditTask task={mockTask} onSave={mockOnSave} onClose={mockOnClose} />)

    const closeButton = screen.getByRole('button', { name: '' })
    await user.click(closeButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<EditTask task={mockTask} onSave={mockOnSave} onClose={mockOnClose} />)

    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    await user.click(cancelButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should update input fields', async () => {
    const user = userEvent.setup()
    render(<EditTask task={mockTask} onSave={mockOnSave} onClose={mockOnClose} />)

    const titleInput = screen.getByLabelText('Title') as HTMLInputElement
    await user.clear(titleInput)
    await user.type(titleInput, 'Updated Task')

    const descriptionInput = screen.getByLabelText('Description') as HTMLInputElement
    await user.clear(descriptionInput)
    await user.type(descriptionInput, 'Updated Description')

    const prioritySelect = screen.getByLabelText('Priority') as HTMLSelectElement
    await user.selectOptions(prioritySelect, 'high')

    const dateInput = screen.getByLabelText('Due Date') as HTMLInputElement
    await user.clear(dateInput)
    await user.type(dateInput, '2026-01-15')

    expect(titleInput.value).toBe('Updated Task')
    expect(descriptionInput.value).toBe('Updated Description')
    expect(prioritySelect.value).toBe('high')
    expect(dateInput.value).toBe('2026-01-15')
  })

  it('should show/hide recurring interval input when toggling recurring checkbox', async () => {
    const user = userEvent.setup()
    render(<EditTask task={mockTask} onSave={mockOnSave} onClose={mockOnClose} />)
    
    const recurringCheckbox = screen.getByLabelText('Recurring Task')
    await user.click(recurringCheckbox)

    await waitFor(() => {
      expect(screen.getByLabelText('Recurring Interval')).toBeInTheDocument()
    })
  })

  it('should update recurring intervals input field', async () => {
    const recurringTask: Task = {
      ...mockTask,
      recurring: true,
      recurringInterval: 'Weekly'
    }
    render(<EditTask task={recurringTask} onSave={mockOnSave} onClose={mockOnClose} />)
    
    expect(screen.getByLabelText('Recurring Task')).toBeChecked()
    expect(screen.getByDisplayValue('Weekly')).toBeInTheDocument()
  })
})

describe('Edit Task - Negative Testing', () => {
  const testDate = new Date(Date.now()).toISOString()
  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    priority: 'low',
    completed: false,
    recurring: false,
    dueDate: testDate,
    createdAt: testDate
  }

  const mockOnSave = vi.fn()
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not call onSave when title is empty', async () => {
    const user = userEvent.setup()
    render(<EditTask task={mockTask} onSave={mockOnSave} onClose={mockOnClose} />)
    
    const titleInput = screen.getByLabelText('Title')
    await user.clear(titleInput)

    const saveButton = screen.getByRole('button', { name: 'Save Changes' })
    await user.click(saveButton)

    expect(mockOnSave).not.toHaveBeenCalled()
  })

  it('should handle task with missing optional input fields', async () => {
    const minimalTask: Task = {
      id: '1',
      title: 'Minimal Task',
      priority: 'low',
      completed: false,
      recurring: false,
      createdAt: testDate
    }

    render(<EditTask task={minimalTask} onSave={mockOnSave} onClose={mockOnClose} />)
    
    expect(screen.getByDisplayValue('Minimal Task')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toHaveValue('')
    expect(screen.getByLabelText('Due Date')).toHaveValue('')
  })

  describe('Handling long text inputs', () => {
    const user = userEvent.setup()
    const longText = 'A'.repeat(300)

    it('should handle long title inputs', async () => {
      render(<EditTask task={mockTask} onSave={mockOnSave} onClose={mockOnClose} />)

      const titleInput = screen.getByLabelText('Title')

      await user.clear(titleInput)

      await user.type(titleInput, longText)

      expect((titleInput as HTMLInputElement).value).toHaveLength(50)
    })
    
    it('should handle long description inputs', async () => {
      render(<EditTask task={mockTask} onSave={mockOnSave} onClose={mockOnClose} />)

      const descInput = screen.getByLabelText('Description')

      await user.clear(descInput)
      await user.type(descInput, longText)

      expect((descInput as HTMLInputElement).value).toHaveLength(200)
    })

    it('should handle long recurring interval inputs', async () => {
      const adjustedTask: Task = {
        ...mockTask,
        recurring: true
      }
      render(<EditTask task={adjustedTask} onSave={mockOnSave} onClose={mockOnClose} />)

      const recurInput = screen.getByLabelText('Recurring Interval')

      await user.clear(recurInput)
      await user.type(recurInput, longText)

      expect((recurInput as HTMLInputElement).value).toHaveLength(20)
    })
  })
})