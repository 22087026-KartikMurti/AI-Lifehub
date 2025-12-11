import { Task } from "@/src/types/task"

let toggleController: AbortController | null = null

export const taskService = {

  async getTasks() { 

    const res = await fetch('api/tasks')
    const data = await res.json()

    if(!res.ok) throw new Error(`${data.error}`)

    return data
  },

  async createTask(task: Task) {

    const response = await fetch('api/tasks', {
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

  async toggleTask(id: string, completed: boolean) {

    // Cancel pending requests upon new request
    if(toggleController) {
      toggleController.abort()
    }

    toggleController = new AbortController

    const res = await fetch('api/tasks', {
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

  async deleteTask(id: string) {
    
    const res = await fetch('api/tasks', {
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