import getBaseUrl from "@/src/utils/getBaseUrl"

/**
 * Service responsible for communicating with the application's AI endpoint.
 *
 * This service sends a user's input to the backend `/api/ai` route, waits for
 * the AI model's response, and returns the generated text. It is designed to
 * be used by UI components or application logic that needs to generate content,
 * answer questions, or process natural-language instructions.
 *
 * @remarks
 * - Resolves the correct backend URL using `getBaseUrl()`.
 * - Sends a JSON payload with the shape `{ input: string }`.
 * - Expects the server to return a JSON object with a `response` string value.
 * - Throws an `Error` if the backend request fails or returns an error payload.
 */
export const aiService = {
  /**
   * Sends a user message to the AI API and returns the generated response.
   *
   * @param userMessage - The raw prompt or instruction to send to the AI model.
   * @returns A Promise that resolves to the AI-generated response text.
   * @throws {Error} If the API request fails, is rejected by the server, or
   * returns an error payload.
   *
   * @example
   * const reply = await aiService.processPrompt("Summarize my top priorities for today.");
   * console.log(reply);
   */
  async processPrompt(userMessage: string): Promise<string> {
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