/**
 * 
 * @param dateStr - String: The date as ISO string or null/undefined
 * @returns A String (formatted date string - 'DD MMM' or 'Today' or 'Tomorrow') or null if invalid
 * 
 * @example
 * // Current Date (Assuming today is 6 December, 2025)
 * formatDate('2025-12-06T00:00:00.000Z') // returns 'Today'
 * @example
 * // Tomorrow's Date (Assuming today is 6 December, 2025)
 * formatDate('2025-12-07T00:00:00.000Z') // returns 'Tomorrow'
 * @example
 * // Future Date (Assuming today is 6 December, 2025)
 * formatDate('2025-12-08T00:00:00.000Z') // returns '8 Dec'
 */

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return null

  const date = new Date(dateStr)

  if(isNaN(date.getTime())) return null

  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  if (date.toDateString() === now.toDateString()) return 'Today'
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
  return date.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })
}

export default formatDate