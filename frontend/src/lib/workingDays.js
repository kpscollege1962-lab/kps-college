import { toLocalDateString, parseLocalDate } from './dateUtils'

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// Weekly closed days (0 = Sunday).
const WEEKLY_OFF_DAYS = [0]

// Fixed-date national holidays as 'MM-DD'; they repeat every year.
// Confirm against the school calendar.
const FIXED_HOLIDAYS = ['03-23', '05-01', '08-14', '12-25']

// Moon-dependent and one-off closures (Eid, Muharram, breaks...) as 'YYYY-MM-DD'.
// Add them here until holidays are managed from the admin panel.
const EXTRA_HOLIDAYS = []

const isHoliday = (dateString) =>
  FIXED_HOLIDAYS.includes(dateString.slice(5)) || EXTRA_HOLIDAYS.includes(dateString)

export const isWorkingDay = (dateString) =>
  !WEEKLY_OFF_DAYS.includes(parseLocalDate(dateString).getDay()) && !isHoliday(dateString)

// Text for a hint like "falls on a Sunday" / "falls on a holiday"; null if it's a normal working day.
export const nonWorkingReason = (dateString) => {
  if (!dateString) return null
  const dayIndex = parseLocalDate(dateString).getDay()
  if (WEEKLY_OFF_DAYS.includes(dayIndex)) return `a ${WEEKDAY_NAMES[dayIndex]}`
  if (isHoliday(dateString)) return 'a holiday'
  return null
}

// First working day strictly AFTER the given date (default: after today).
export const getNextWorkingDay = (fromDateString = toLocalDateString()) => {
  const d = parseLocalDate(fromDateString)
  do {
    d.setDate(d.getDate() + 1)
  } while (!isWorkingDay(toLocalDateString(d)))
  return toLocalDateString(d)
}