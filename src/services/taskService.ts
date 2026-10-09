/**
 * Task management API service.
 *
 * Exposes a set of CRUD-style helper methods for interacting with the backend
 * task endpoints. Each method performs an HTTP request, parses the JSON response,
 * and throws an `Error` when the server responds with a non-OK status.
 */
import { Task } from "@/src/types/task"
import getBaseUrl from "@/src/utils/getBaseUrl"

/**
 * Tracks the most recent toggle request so subsequent toggle actions can abort
 * any in-flight request before issuing a new one.
 */
let toggleController: AbortController | null = null

export const taskService = {

  /**
   * Retrieves all tasks from the backend.
   *
   * @returns {Promise<any>} A promise that resolves to the task list returned by the API.
   * @throws {Error} If the request fails or the backend returns an error payload.
   */
  async getTasks(): Promise<any> {
    const res = await fetch(`${getBaseUrl()}/api/tasks`)
    const data = await res.json()

    if(!res.ok) throw new Error(`${data.error}`)

    return data
  },

  /**
   * Creates a new task.
   *
   * @param {Task} task - The task payload to persist.
   * @returns {Promise<any>} A promise that resolves to the created task payload from the API.
   * @throws {Error} If the request fails or the backend returns an error payload.
   */
  async createTask(task: Task): Promise<any> {
    const response = await fetch(`${getBaseUrl()}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify(task)
    })

    const data = await response.json()

    if(!response.ok) throw new Error(`${data.error}`)

    return data
  },

  /**
   * Updates an existing task by id.
   *
   * @param {string} id - The unique identifier of the task to update.
   * @param {Partial<Task>} formData - The partial task data to merge into the existing task.
   * @returns {Promise<any>} A promise that resolves to the updated task returned by the API.
   * @throws {Error} If the request fails or the backend returns an error payload.
   */
  async updateTask(id: string, formData: Partial<Task>): Promise<any> {
    const res = await fetch(`${getBaseUrl()}/api/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({ id, formData })
    })

    const data = await res.json()

    if(!res.ok) throw new Error(`${data.error}`)

    return data
  },

  /**
   * Toggles a task's completion status.
   *
   * Before sending a new toggle request, any previously pending toggle request is aborted.
   * This prevents stale requests from overwriting newer state updates.
   *
   * @param {string} id - The task identifier.
   * @param {boolean} completed - The new completion state to apply to the task.
   * @returns {Promise<any>} A promise that resolves to the updated task returned by the API.
   * @throws {Error} If the request fails or the backend returns an error payload.
   */
  async toggleTask(id: string, completed: boolean): Promise<any> {
    // Cancel pending requests upon new request
    if(toggleController) {
      toggleController.abort()
    }

    toggleController = new AbortController

    const res = await fetch(`${getBaseUrl()}/api/tasks`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, completed }),
      signal: toggleController.signal
    })

    const data = await res.json()

    if(!res.ok) throw new Error(`${data.error}`)

    return data
  },

  /**
   * Deletes a task by id.
   *
   * @param {string} id - The unique identifier of the task to delete.
   * @returns {Promise<any>} A promise that resolves to the backend response for the delete action.
   * @throws {Error} If the request fails or the backend returns an error payload.
   */
  async deleteTask(id: string): Promise<any> {
    const res = await fetch(`${getBaseUrl()}/api/tasks`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({ id })
    })

    const data = await res.json()
    
    if(!res.ok) throw new Error(`${data.error}`)

    return data
  }
}