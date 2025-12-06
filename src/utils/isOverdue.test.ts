import { describe, it, expect } from 'vitest'
import isOverdue from './isOverdue'

describe('Task Overdue', () => {

  describe('Input Validation', () => {
    it('returns false when "dueDate" or "completed" is null, undefined or an empty string', () => {   
      expect(isOverdue(null as any, null as any)).toBe(false)
      expect(isOverdue(null as any, undefined as any)).toBe(false)
      expect(isOverdue("" as any, null as any)).toBe(false)
      expect(isOverdue(undefined as any, null as any)).toBe(false)
    })

    it('returns false if task due but completed', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString()

      expect(isOverdue(yesterdayStr, true)).toBe(false)
    })

    it('returns false if invalid date provided', () => {
      expect(isOverdue('invalid-date', false)).toBe(false)
      expect(isOverdue('Not a date', false)).toBe(false)
    })
  })
  
  describe('Functionality Tests (assume that task is not completed)', () => {
    it('returns true if task is overdue', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString()

      expect(isOverdue(yesterdayStr, false)).toBe(true)
    })

    it('returns false if task due today', () => {
      const today = new Date().toISOString()

      expect(isOverdue(today, false)).toBe(false)
    })

    it('returns false if task due in future date', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStr = tomorrow.toISOString()

      expect(isOverdue(tomorrowStr, false)).toBe(false)
    })
  })
})