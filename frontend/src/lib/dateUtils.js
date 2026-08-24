import { parseISO, format, isValid } from 'date-fns'

export function formatDate(val) {
  if (!val) return null
  const date = parseISO(val)
  return isValid(date) ? format(date, 'MMM dd, yyyy') : null
}

export function formatDateNumeric(val) {
  if (!val) return null
  const date = parseISO(val)
  return isValid(date) ? format(date, 'dd/MM/yyyy') : null
}
