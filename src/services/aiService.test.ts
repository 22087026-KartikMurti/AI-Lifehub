import { describe, beforeEach, vi, afterEach, it, expect } from "vitest";
import { aiService } from "./aiService";

vi.mock('@/src/utils/getBaseUrl', () => ({
  default: () => 'http://localhost:3000'
}))

describe('AI Service', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should process prompt successfully with correct API call and payload', async () => {
    const mockResponse = { response: 'Mock AI response'}

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    } as Response)

    const result = await aiService.processPrompt('Test message')

    expect(result).toBe('Mock AI response')
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/ai'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ input: 'Test message' })
      })
    )
  })

  it('should throw error when API response is not ok', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Error check'})
    } as Response)

    await expect(aiService.processPrompt('Test')).rejects.toThrow('Error check')
  })

  it("should throw status code when error doesn't parse", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => { throw new Error('Invalid JSON') }
    } as unknown as Response)

    await expect(aiService.processPrompt('Test')).rejects.toThrow('API request failed with status 400')
  })

  it('should throw error when fetch fails', async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network Error'))

    await expect (aiService.processPrompt('Test')).rejects.toThrow('Network Error')
  })
})