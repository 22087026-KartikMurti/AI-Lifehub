import { describe, it, expect } from 'vitest'
import formatDate from './formatDate'

describe('Date Format', () => {
  describe('Input Validations', () => {
    it('returns null if no date provided', () => {
      expect(formatDate("")).toBe(null)
      expect(formatDate(null as any)).toBe(null)
      expect(formatDate(undefined as any)).toBe(null)
    })

    it('returns null if invalid date provided', () => {
      expect(formatDate('invalid-date')).toBe(null)
      expect(formatDate('Not a date')).toBe(null)
    }) 
  }) 

  describe('Functionality Tests', () => {
    it('returns "Today" for current date', () => {
      const today = new Date().toISOString()
      
      expect(formatDate(today)).toBe('Today')
    })

    it('returns "Tomorrow" for next day', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStr = tomorrow.toISOString()
      
      expect(formatDate(tomorrowStr)).toBe('Tomorrow')
    })

    it('returns the date in "DD MMM" format if date is not today or tomorrow', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 2)
      const futureDateStr = futureDate.toISOString()
      const futureResult = formatDate(futureDateStr)
      
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 2)
      const pastDateStr = pastDate.toISOString()
      const pastResult = formatDate(pastDateStr)

      expect(futureResult).toMatch(/^\d{1,2} [A-Za-z]{3,4}$/)
      expect(pastResult).toMatch(/^\d{1,2} [A-Za-z]{3,4}$/)
    })
  })
})