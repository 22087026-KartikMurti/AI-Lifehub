import { describe, it, expect } from 'vitest'
import getPriorityColour from './getPriorityColour'

describe('Priority Colours', () => {
  it('returns red colors for high priority', () => {
    expect(getPriorityColour('high')).toBe('bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-50')
  })

  it('returns yellow colors for medium priority', () => {
    expect(getPriorityColour('medium')).toBe('bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-50')
  })

  it('returns green colors for low priority', () => {
    expect(getPriorityColour('low')).toBe('bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100')
  })

  it('returns gray colors for unknown priority', () => {
    expect(getPriorityColour('unknown')).toBe('bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100')
    expect(getPriorityColour('')).toBe('bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100')
  })
})