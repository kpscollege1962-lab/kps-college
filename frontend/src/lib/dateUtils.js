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
const pad = (n) => String(n).padStart(2, '0')

// 'YYYY-MM-DD' in the user's LOCAL timezone. (toISOString() uses UTC, which is
// off by a day for part of the day in timezones like UTC+5.)
export const toLocalDateString = (date = new Date()) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

export const getTomorrowDateString = () => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return toLocalDateString(d)
}

// Parses 'YYYY-MM-DD' as a local date (new Date('YYYY-MM-DD') parses as UTC).
export const parseLocalDate = (dateString) => {
  const [y, m, d] = dateString.split('-').map(Number)
  return new Date(y, m - 1, d)
}