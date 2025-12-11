export const aiService = {
  async processPrompt(userMessage: string) {
    const response = await fetch('api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        
        body: JSON.stringify({ input: userMessage })
      })

      if(!response.ok) throw new Error('Failed to process prompt')
      
      const data = await response.json()

      return data.response
  }
}