import { describe, it, expect, afterEach } from "vitest";
import getBaseUrl from "./getBaseUrl";

describe('Get Base Url', () => {
  const originalWindow = global.window
  const originalEnv = process.env.NEXT_PUBLIC_BASE_URL

  afterEach(() => {
    global.window = originalWindow
    process.env.NEXT_PUBLIC_BASE_URL = originalEnv
  })

  it('should return window.location.origin in browser environment', () =>{
    Object.defineProperty(global, 'window', {
      value: {
        location: {
          origin: 'https://example.com'
        }
      },
      writable: true,
      configurable: true
    })

    expect(getBaseUrl()).toBe('https://example.com')
  })

  it('should return NEXT_PUBLIC_BASE_URL in server environment when set in .env file and window is undefined', () => {
    delete (global as any).window
    process.env.NEXT_PUBLIC_BASE_URL = 'https://production.com'

    expect(getBaseUrl()).toBe('https://production.com')
  })

  it('should return a local host fallback in server environment when NEXT_PUBLIC_BASE_URL is not set', () => {
    delete (global as any).window
    delete process.env.NEXT_PUBLIC_BASE_URL

    expect(getBaseUrl()).toBe('http://localhost:3000')
  })

  it('should prioritise window.location.origin over everything else', () => {
    Object.defineProperty(global, 'window', {
      value: {
        location: {
          origin: 'https://example.com'
        }
      },
      writable: true,
      configurable: true
    })

    process.env.NEXT_PUBLIC_BASE_URL = 'https://production.com'

    expect(getBaseUrl()).toBe('https://example.com')
  })
})