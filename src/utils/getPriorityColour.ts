/**
 * Returns Tailwind CSS classes for styling task priority badges.
 * Available options so far are: 'high', 'medium', 'low' and a default option
 * 
 * @param priority - String: The priority level of the task
 * @returns Tailwind CSS classes for background and text color of priority element for task
 * 
 * @example
 * // If priority of task is high:
 * getPriorityColour('high') // returns 'bg-red-100 text-red-800'
 */

const getPriorityColour = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800'
    case 'medium': return 'bg-yellow-100 text-yellow-800'
    case 'low': return 'bg-green-100 text-green-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export default getPriorityColour