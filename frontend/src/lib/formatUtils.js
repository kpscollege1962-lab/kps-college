/**
 * Formats a string into Pakistani CNIC/B-Form format: XXXXX-XXXXXXX-X
 * Pass prevValue so the formatter knows whether the user is typing or deleting —
 * trailing dashes are only appended when adding digits, preventing the cursor
 * from getting stuck when backspacing over a dash boundary.
 */
export const formatCnic = (value, prevValue = '') => {
  const digits     = value.replace(/\D/g, '').slice(0, 13)
  const prevDigits = prevValue.replace(/\D/g, '')
  const deleting   = digits.length < prevDigits.length

  if (digits.length <= 4)   return digits
  if (digits.length === 5)  return deleting ? digits : `${digits}-`
  if (digits.length <= 11)  return `${digits.slice(0, 5)}-${digits.slice(5)}`
  if (digits.length === 12) return deleting
    ? `${digits.slice(0, 5)}-${digits.slice(5)}`
    : `${digits.slice(0, 5)}-${digits.slice(5)}-`
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`
}
