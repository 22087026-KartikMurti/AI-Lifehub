/** 
 * Checks if a task is overdue based on due date and whether it has been completed
 * or not
 *  
 * @param dueDate - String: The due date of the task
 * @param completed - Boolean: Whether the task is completed or not
 * @returns true if task is overdue, false if not 
 * 
 * @example 
 * // Task due yesterday and not completed
 * isOverdue('2025-12-05T00:00:00.000Z', false) // returns true
 */ 

const isOverdue = (dueDate: string | null | undefined, completed: boolean) => {
  if(!dueDate || completed) return false

  const today = new Date()
  const due = new Date(dueDate)
  if(isNaN(due.getTime())) return false

  //hours set as 0 because if due today it shouldn't say overdue, so due(today) < today is false
  today.setHours(0,0,0,0)
  due.setHours(0,0,0,0)

  return due < today
}

export default isOverdue