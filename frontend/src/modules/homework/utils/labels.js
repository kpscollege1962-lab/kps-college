export const ordinal = (n) => {
  const mod100 = n % 100
  const suffix = mod100 >= 11 && mod100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] ?? 'th')
  return `${n}${suffix}`
}

export const classNameText = (name) => {
  const text = String(name ?? '').trim()
  return /^\d+$/.test(text) ? ordinal(parseInt(text, 10)) : text
}

export const classLabelText = (name, sectionName) =>
  [classNameText(name), sectionName].filter(Boolean).join(' ')

export const joinParts = (...parts) => parts.filter(Boolean).join(' ')