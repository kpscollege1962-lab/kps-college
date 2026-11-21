import { formatDate } from '@/lib/dateUtils'

// The assignments date-range View (teacher Manage classes and the admin Assignments page):
// Assigned Date = "from", Due Date = "to", a range on the ASSIGNED date, both ends inclusive,
// and an empty end is open.

// Query params for the API: { assignedFrom?, assignedTo? }
export const assignedRangeParams = ({ assignedDate, dueDate }) => ({
  ...(assignedDate && { assignedFrom: assignedDate }),
  ...(dueDate && { assignedTo: dueDate }),
})

// "on Nov 20, 2026", "from … to …", "from …", "up to …" or "on any date".
export const assignedRangeText = ({ assignedDate: from, dueDate: to }) => {
  if (from && to) return from === to ? `on ${formatDate(from)}` : `from ${formatDate(from)} to ${formatDate(to)}`
  if (from) return `from ${formatDate(from)}`
  if (to) return `up to ${formatDate(to)}`
  return 'on any date'
}

export const isReversedRange = ({ assignedDate, dueDate }) =>
  Boolean(assignedDate && dueDate && dueDate < assignedDate)
