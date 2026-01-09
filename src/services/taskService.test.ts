import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { taskService } from './taskService'
import { Task } from '@/src/types/task'

vi.mock('@/src/utils/getBaseUrl', () => ({
  default: () => 'http://localhost:3000'
}))

describe('Task Service', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Get Tasks Count', () => {
    it('should fetch task counts correctly', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ count: 5 })
      } as Response)

      const count = await taskService.getTaskCount()

      expect(count).toBe(5)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/tasks/count')
      )
    })

    it('should throw error when API fails', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false, 
        json: async () => ({ error: 'Failed to get count' })
      } as Response)

      await expect(taskService.getTaskCount()).rejects.toThrow('Failed to get count')
    })
  })

  describe('Get Tasks', () => {
    it('should fetch all tasks succcessfully', async () => {
      const createdDate = new Date(Date.now()).toISOString()
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Test Task 1',
          description: 'Test Description 2',
          priority: 'high',
          completed: true,
          recurring: false,
          createdAt: createdDate
        },
        {
          id: '2',
          title: 'Test Task 2',
          description: 'Test Description 2',
          priority: 'medium',
          completed: false,
          recurring: true,
          recurringInterval: 'Daily',
          createdAt: createdDate
        }
      ]

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTasks
      } as Response)

      const tasks = await taskService.getTasks()

      expect(tasks).toEqual(mockTasks)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/tasks')
      )
    })

    it('should throw error when API fails', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false, 
        json: async () => ({ error: 'Failed to fetch tasks' })
      } as Response)

      await expect(taskService.getTasks()).rejects.toThrow('Failed to fetch tasks')
    })
  })

  describe('Create Task', () => {
    const createdDate = new Date(Date.now()).toISOString()
    const newTask: Task = {
      id: '1',
      title: 'New Task',
      description: 'New Description',
      priority: 'medium',
      completed: false,
      recurring: false,
      createdAt: createdDate
    }

    it('should create task successfully', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => newTask
      } as Response)

      const result = await taskService.createTask(newTask)

      expect(result).toEqual(newTask)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/tasks'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTask)
        })
      )
    })

    it('should throw error when creation fails', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Failed to create task' })
      } as Response)

      await expect(taskService.createTask(newTask)).rejects.toThrow('Failed to create task')
    })
  })

  describe('Update Task', () => {
    const createdDate = new Date(Date.now()).toISOString()
    const updatedTask: Task = {
      id: '1',
      title: 'Updated Task',
      priority: 'medium',
      completed: false,
      recurring: false,
      createdAt: createdDate
    }

    it('should update task successfully', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => updatedTask
      } as Response)

      const result = await taskService.updateTask('1', updatedTask)

      expect(result).toEqual(updatedTask)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/tasks/1'),
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: '1', formData: updatedTask })
        })
      )
    })

    it('should throw error when update fails', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Failed to update task' })
      } as Response)

      await expect(taskService.updateTask('1', updatedTask)).rejects.toThrow('Failed to update task')
    })
  })

  describe('Toggle Task', () => {
    const toggledTask: Partial<Task> = {
      id: '1',
      completed: true
    }

    it('should toggle task successfully', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => toggledTask
      } as Response)

      const result = await taskService.toggleTask(toggledTask.id!, toggledTask.completed!)

      expect(result).toEqual(toggledTask)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/tasks'),
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(toggledTask)
        })
      )
    })

    it('should abort previous toggle request when new one is made', async () => {
      const abortSpy = vi.fn()

      // First request -> never resolves
      vi.mocked(global.fetch).mockImplementationOnce((url, options) => {
        const signal = options?.signal as AbortSignal
        signal?.addEventListener('abort', abortSpy)
        return new Promise(() => {})
      })

      taskService.toggleTask(toggledTask.id!, toggledTask.completed!)

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => toggledTask
      } as Response)

      await taskService.toggleTask(toggledTask.id!, toggledTask.completed!)

      expect(abortSpy).toHaveBeenCalled()
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/tasks'),
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(toggledTask)
        })
      )
    })

    it('should throw error when toggle fails', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Failed to toggle task' })
      } as Response)

      await expect(taskService.toggleTask(toggledTask.id!, toggledTask.completed!)).rejects.toThrow('Failed to toggle task')
    })
  })

  describe('Delete Task', () => {
    const deletedTask: Partial<Task> = {
      id: '1',
      title: 'Deleted Task',
      priority: 'low',
      completed: true,
      recurring: false
    }
    it('should delete task successfully', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => deletedTask
      } as Response)

      const result = await taskService.deleteTask(deletedTask.id!)

      expect(result).toEqual(deletedTask)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/tasks'),
        expect.objectContaining({
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: deletedTask.id! })
        })
      )
    })

    it('should throw error when deletion fails', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Failed to delete task' })
      } as Response)

      await expect(taskService.deleteTask(deletedTask.id!))
        .rejects.toThrow('Failed to delete task')
    })
  })

  describe('Network Errors', () => {
    it('should propagate network errors', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network Error'))

      await expect(taskService.getTasks()).rejects.toThrow('Network Error')
    })
  })
})