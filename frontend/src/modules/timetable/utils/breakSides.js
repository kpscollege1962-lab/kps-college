// Which break sides a preview cell's classes take (a teacher or subject with several classes in
// one period). Each class takes its break before or after the period.
export const breakSidesOf = (entries, hasBreak) => {
  if (!hasBreak) return new Set()
  return new Set(entries.map((e) => e?.breakPosition).filter((p) => p === 'before' || p === 'after'))
}

// Padding so cell text never runs under the strips (w-6 = 24px strip; narrow w-4 = 16px).
export const breakPadding = (sides, narrow = false) =>
  `${sides.has('before') ? (narrow ? 'pl-5' : 'pl-7') : ''} ${sides.has('after') ? (narrow ? 'pr-5' : 'pr-7') : ''}`
