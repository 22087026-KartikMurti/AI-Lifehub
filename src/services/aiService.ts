import getBaseUrl from "@/src/utils/getBaseUrl"

export const aiService = {
  async processPrompt(userMessage: string) {
    const response = await fetch(`${getBaseUrl()}/api/ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      
      body: JSON.stringify({ input: userMessage })
    })

    if(!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `API request failed with status ${response.status}`)
    }
    
    const data = await response.json()

    return data.response
  }
}