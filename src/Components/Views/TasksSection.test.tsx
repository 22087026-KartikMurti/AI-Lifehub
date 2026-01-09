import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TasksPage from './TasksSection'
import { taskService } from '@/src/services/taskService'
import { Task } from '@/src/types/task'

vi.mock('@/src/services/taskService')

describe('TasksSection', () => {
  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Task 1',
      description: 'Description 1',
      priority: 'high',
      completed: false,
      recurring: false,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Task 2',
      description: 'Description 2',
      priority: 'medium',
      completed: true,
      recurring: false,
      createdAt: new Date().toISOString()
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial Rendering', () => {
    it('should show loading state initially', () => {
      vi.mocked(taskService.getTasks).mockImplementation(() => new Promise(() => {}))

      render(<TasksPage />)

      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should fetch and display tasks', async () => {
      vi.mocked(taskService.getTasks).mockResolvedValue(mockTasks)

      render(<TasksPage />)

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument()
        expect(screen.getByText('Task 2')).toBeInTheDocument()
      })
    })

    it('should display completed tasks count correctly', async () => {
      vi.mocked(taskService.getTasks).mockResolvedValue(mockTasks)

      render(<TasksPage />)

      await waitFor(() => {
        expect(screen.getByText('1 / 2')).toBeInTheDocument()
      })
    })

    it('should show yellow color when not all tasks are completed', async () => {
      vi.mocked(taskService.getTasks).mockResolvedValue(mockTasks)

      const { container } = render(<TasksPage />)

      await waitFor(() => {
        const countSpan = container.querySelector('.text-yellow-600')
        expect(countSpan).toBeInTheDocument()
      })
    })

    it('should show green color when all tasks are completed', async () => {
      const completedTasks = mockTasks.map(t => ({ ...t, completed: true }))
      vi.mocked(taskService.getTasks).mockResolvedValue(completedTasks)

      const { container } = render(<TasksPage />)

      await waitFor(() => {
        const countSpan = container.querySelector('.text-green-500')
        expect(countSpan).toBeInTheDocument()
      })
    })

    it('should show empty state when no tasks', async () => {
      vi.mocked(taskService.getTasks).mockResolvedValue([])

      render(<TasksPage />)

      await waitFor(() => {
        expect(screen.getByText('No tasks yet')).toBeInTheDocument()
        expect(screen.getByText('Go to Chat to create your first task')).toBeInTheDocument()
      })
    })

    it('should show error toast when fetching tasks fails', async () => {
      vi.mocked(taskService.getTasks).mockRejectedValue(new Error('Network error'))

      render(<TasksPage />)

      await waitFor(() => {
        expect(screen.getByText(/Failed to fetch tasks/)).toBeInTheDocument()
      })
    })
  })

  describe('Task Toggle', () => {
    it('should toggle task completion to completed', async () => {
      const user = userEvent.setup()
      vi.mocked(taskService.getTasks).mockResolvedValue(mockTasks)
      vi.mocked(taskService.toggleTask).mockResolvedValue({ ...mockTasks[0], completed: true })

      render(<TasksPage />)

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument()
      })

      const toggleButton = screen.getAllByRole('button', { name: 'Toggle task completion' })[0]
      await user.click(toggleButton)

      await waitFor(() => {
        expect(screen.getByText('Task Complete!')).toBeInTheDocument()
      })
      expect(taskService.toggleTask).toHaveBeenCalledWith('1', true)
    })

    it('should toggle task completion to not completed', async () => {
      const user = userEvent.setup()
      vi.mocked(taskService.getTasks).mockResolvedValue(mockTasks)
      vi.mocked(taskService.toggleTask).mockResolvedValue({ ...mockTasks[1], completed: false })

      render(<TasksPage />)

      await waitFor(() => {
        expect(screen.getByText('Task 2')).toBeInTheDocument()
      })

      const toggleButton = screen.getAllByRole('button', { name: 'Toggle task completion' })[1]
      await user.click(toggleButton)

      await waitFor(() => {
        expect(screen.getByText('Task complete undone')).toBeInTheDocument()
      })
      expect(taskService.toggleTask).toHaveBeenCalledWith('2', false)
    })

    it('should handle toggle error', async () => {
      const user = userEvent.setup()
      vi.mocked(taskService.getTasks).mockResolvedValue(mockTasks)
      vi.mocked(taskService.toggleTask).mockRejectedValue(new Error('Toggle failed'))

      render(<TasksPage />)

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument()
      })

      const toggleButton = screen.getAllByRole('button', { name: 'Toggle task completion' })[0]
      await user.click(toggleButton)

      await waitFor(() => {
        expect(screen.getByText(/Failed to toggle task/)).toBeInTheDocument()
      })
    })

    it('should not show error toast for AbortError', async () => {
      const user = userEvent.setup()
      vi.mocked(taskService.getTasks).mockResolvedValue(mockTasks)
      
      const abortError = new Error('Aborted')
      abortError.name = 'AbortError'
      vi.mocked(taskService.toggleTask).mockRejectedValue(abortError)

      render(<TasksPage />)

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument()
      })

      const toggleButton = screen.getAllByRole('button', { name: 'Toggle task completion' })[0]
      await user.click(toggleButton)

      // Should not show error toast
      await waitFor(() => {
        expect(screen.queryByText(/Failed to toggle task/)).not.toBeInTheDocument()
      }, { timeout: 1000 })
    })
  })

  describe('Task Deletion', () => {
    it('should delete task successfully', async () => {
      const user = userEvent.setup()
      vi.mocked(taskService.getTasks).mockResolvedValue(mockTasks)
      vi.mocked(taskService.deleteTask).mockResolvedValue({ 
        title: 'Task 1',
        description: 'Description 1',
        priority: 'high',
        completed: false,
        recurring: false
      })

      render(<TasksPage />)

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument()
      })

      const deleteButton = screen.getAllByRole('button', { name: 'Delete task' })[0]
      await user.click(deleteButton)

      await waitFor(() => {
        expect(screen.getByText('Task Deleted Successfully!')).toBeInTheDocument()
        expect(screen.queryByText('Task 1')).not.toBeInTheDocument()
      })
    })

    it('should show undo option after deletion', async () => {
      const user = userEvent.setup()
      vi.mocked(taskService.getTasks).mockResolvedValue(mockTasks)
      vi.mocked(taskService.deleteTask).mockResolvedValue({ 
        title: 'Task 1',
        priority: 'high',
        completed: false,
        recurring: false
      })

      render(<TasksPage />)

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument()
      })

      const deleteButton = screen.getAllByRole('button', { name: 'Delete task' })[0]
      await user.click(deleteButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument()
      })
    })

    it('should restore deleted task when undo is clicked', async () => {
      const user = userEvent.setup()
      vi.mocked(taskService.getTasks).mockResolvedValue(mockTasks)
      vi.mocked(taskService.deleteTask).mockResolvedValue({ 
        title: 'Task 1',
        priority: 'high',
        completed: false,
        recurring: false
      })
      vi.mocked(taskService.createTask).mockResolvedValue(mockTasks[0])

      render(<TasksPage />)

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument()
      })

      const deleteButton = screen.getAllByRole('button', { name: 'Delete task' })[0]
      await user.click(deleteButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument()
      })

      const undoButton = screen.getByRole('button', { name: 'Undo' })
      await user.click(undoButton)

      await waitFor(() => {
        expect(screen.getByText('Task Restored!')).toBeInTheDocument()
      })
    })

    it('should handle deletion error', async () => {
      const user = userEvent.setup()
      vi.mocked(taskService.getTasks).mockResolvedValue(mockTasks)
      vi.mocked(taskService.deleteTask).mockRejectedValue(new Error('Delete failed'))

      render(<TasksPage />)

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument()
      })

      const deleteButton = screen.getAllByRole('button', { name: 'Delete task' })[0]
      await user.click(deleteButton)

      await waitFor(() => {
        expect(screen.getByText(/Failed to delete task/)).toBeInTheDocument()
      })
    })

    it('should handle restore error', async () => {
      const user = userEvent.setup()
      vi.mocked(taskService.getTasks).mockResolvedValue(mockTasks)
      vi.mocked(taskService.deleteTask).mockResolvedValue({ 
        title: 'Task 1',
        priority: 'high',
        completed: false,
        recurring: false
      })
      vi.mocked(taskService.createTask).mockRejectedValue(new Error('Restore failed'))

      render(<TasksPage />)

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument()
      })

      const deleteButton = screen.getAllByRole('button', { name: 'Delete task' })[0]
      await user.click(deleteButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument()
      })

      const undoButton = screen.getByRole('button', { name: 'Undo' })
      await user.click(undoButton)

      await waitFor(() => {
        expect(screen.getByText(/Failed to restore task/)).toBeInTheDocument()
      })
    })
  })

  describe('Task Update', () => {
    it('should open edit modal when edit button is clicked', async () => {
      const user = userEvent.setup()
      vi.mocked(taskService.getTasks).mockResolvedValue(mockTasks)

      render(<TasksPage />)

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument()
      })

      const editButton = screen.getAllByRole('button', { name: 'Edit task' })[0]
      await user.click(editButton)

      await waitFor(() => {
        expect(screen.getByText('Edit Task')).toBeInTheDocument()
      })
    })

    it('should update task successfully', async () => {
      const user = userEvent.setup()
      vi.mocked(taskService.getTasks).mockResolvedValue(mockTasks)
      vi.mocked(taskService.updateTask).mockResolvedValue({
        ...mockTasks[0],
        title: 'Updated Task'
      })

      render(<TasksPage />)

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument()
      })

      const editButton = screen.getAllByRole('button', { name: 'Edit task' })[0]
      await user.click(editButton)

      await waitFor(() => {
        expect(screen.getByText('Edit Task')).toBeInTheDocument()
      })

      const titleInput = screen.getByLabelText('Title')
      await user.clear(titleInput)
      await user.type(titleInput, 'Updated Task')

      const saveButton = screen.getByRole('button', { name: 'Save Changes' })
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText('Task Updated!')).toBeInTheDocument()
      })
    })

    it('should show undo option after update', async () => {
      const user = userEvent.setup()
      vi.mocked(taskService.getTasks).mockResolvedValue(mockTasks)
      vi.mocked(taskService.updateTask).mockResolvedValue({
        ...mockTasks[0],
        title: 'Updated Task'
      })

      render(<TasksPage />)

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument()
      })

      const editButton = screen.getAllByRole('button', { name: 'Edit task' })[0]
      await user.click(editButton)

      await waitFor(() => {
        expect(screen.getByText('Edit Task')).toBeInTheDocument()
      })

      const titleInput = screen.getByLabelText('Title')
      await user.clear(titleInput)
      await user.type(titleInput, 'Updated Task')

      const saveButton = screen.getByRole('button', { name: 'Save Changes' })
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument()
      })
    })

    it('should restore previous task details when undo is clicked', async () => {
      const user = userEvent.setup()
      vi.mocked(taskService.getTasks).mockResolvedValue(mockTasks)
      vi.mocked(taskService.updateTask)
        .mockResolvedValueOnce({ ...mockTasks[0], title: 'Updated Task' })
        .mockResolvedValueOnce(mockTasks[0])

      render(<TasksPage />)

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument()
      })

      const editButton = screen.getAllByRole('button', { name: 'Edit task' })[0]
      await user.click(editButton)

      await waitFor(() => {
        expect(screen.getByText('Edit Task')).toBeInTheDocument()
      })

      const titleInput = screen.getByLabelText('Title')
      await user.clear(titleInput)
      await user.type(titleInput, 'Updated Task')

      const saveButton = screen.getByRole('button', { name: 'Save Changes' })
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument()
      })

      const undoButton = screen.getByRole('button', { name: 'Undo' })
      await user.click(undoButton)

      await waitFor(() => {
        expect(screen.getByText('Previous Task Restored!')).toBeInTheDocument()
      })
    })

    it('should handle update error', async () => {
      const user = userEvent.setup()
      vi.mocked(taskService.getTasks).mockResolvedValue(mockTasks)
      vi.mocked(taskService.updateTask).mockRejectedValue(new Error('Update failed'))

      render(<TasksPage />)

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument()
      })

      const editButton = screen.getAllByRole('button', { name: 'Edit task' })[0]
      await user.click(editButton)

      await waitFor(() => {
        expect(screen.getByText('Edit Task')).toBeInTheDocument()
      })

      const titleInput = screen.getByLabelText('Title')
      await user.clear(titleInput)
      await user.type(titleInput, 'Updated Task')

      const saveButton = screen.getByRole('button', { name: 'Save Changes' })
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText(/Failed to update task/)).toBeInTheDocument()
      })
    })

    it('should handle null updated task', async () => {
      const user = userEvent.setup()
      vi.mocked(taskService.getTasks).mockResolvedValue(mockTasks)
      vi.mocked(taskService.updateTask).mockResolvedValue(null as any)

      render(<TasksPage />)

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument()
      })

      const editButton = screen.getAllByRole('button', { name: 'Edit task' })[0]
      await user.click(editButton)

      await waitFor(() => {
        expect(screen.getByText('Edit Task')).toBeInTheDocument()
      })

      const saveButton = screen.getByRole('button', { name: 'Save Changes' })
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText(/Updated task returned as null/)).toBeInTheDocument()
      })
    })

    it('should handle restore previous task error', async () => {
      const user = userEvent.setup()
      vi.mocked(taskService.getTasks).mockResolvedValue(mockTasks)
      vi.mocked(taskService.updateTask)
        .mockResolvedValueOnce({ ...mockTasks[0], title: 'Updated Task' })
        .mockRejectedValueOnce(new Error('Restore failed'))

      render(<TasksPage />)

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument()
      })

      const editButton = screen.getAllByRole('button', { name: 'Edit task' })[0]
      await user.click(editButton)

      await waitFor(() => {
        expect(screen.getByText('Edit Task')).toBeInTheDocument()
      })

      const titleInput = screen.getByLabelText('Title')
      await user.clear(titleInput)
      await user.type(titleInput, 'Updated Task')

      const saveButton = screen.getByRole('button', { name: 'Save Changes' })
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument()
      })

      const undoButton = screen.getByRole('button', { name: 'Undo' })
      await user.click(undoButton)

      await waitFor(() => {
        expect(screen.getByText(/Failed to restore previous task details/)).toBeInTheDocument()
      })
    })
  })
})