import PrintHeader from './Printheader.jsx'
import PrintWatermark from './PrintWatermark.jsx'

const formatTimeShort = (t) => {
  if (!t) return null
  const [h, m] = t.split(':').map(Number)
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

const toSeconds = (t) => {
  if (!t) return null
  const [h, m, s = 0] = t.split(':').map(Number)
  return h * 3600 + m * 60 + s
}

const formatDuration = (timing) => {
  if (!timing?.start_time || !timing?.end_time) return '–'
  const totalMin = Math.round((toSeconds(timing.end_time) - toSeconds(timing.start_time)) / 60)
  const breakMin = (timing.break_duration ?? 0) > 0 ? timing.break_duration : null
  const instrMin = breakMin != null ? totalMin - breakMin : totalMin
  return breakMin != null ? `${instrMin}|${breakMin}min` : `${instrMin}min`
}

const formatRange = (timing) => {
  const start = formatTimeShort(timing?.start_time)
  const end   = formatTimeShort(timing?.end_time)
  if (!start || !end) return '–'
  return `${start} – ${end}`
}

const ordinalSuffix = (n) => {
  const j = n % 10, k = n % 100
  if (j === 1 && k !== 11) return 'st'
  if (j === 2 && k !== 12) return 'nd'
  if (j === 3 && k !== 13) return 'rd'
  return 'th'
}

// Renders "7 EAGLE" as "7ᵗʰ E" — see the same helper in ClassWisePreview.jsx.
const ClassLabel = ({ classGroupName, sectionName }) => {
  const n = parseInt(classGroupName, 10)
  const numberPart = Number.isNaN(n)
    ? classGroupName
    : <>{n}<sup className="text-[0.65em]">{ordinalSuffix(n)}</sup></>
  const sectionAbbrev = sectionName ? sectionName.charAt(0).toUpperCase() : null
  return <>{numberPart}{sectionAbbrev && <span className="ml-0.5">{sectionAbbrev}</span>}</>
}

// Only applied when falling back to a staff member's full name (initials are
// left as-is, since "Mr. H.A.K." would read oddly).
const withMr = (fullName) => (fullName ? `Mr. ${fullName}` : fullName)

const secondsToClock = (totalSeconds) => {
  const wrapped = ((totalSeconds % 86400) + 86400) % 86400
  const h = Math.floor(wrapped / 3600)
  const m = Math.floor((wrapped % 3600) / 60)
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// Returns BOTH possible break windows for a period — "before" (break sits at
// the start of the period) and "after" (break sits at the end). Which one
// actually applies to a given class/period is determined per-cell by that
// slot's own break_position, but the header note shows both windows since
// break_position can differ row to row for the same period.
const computeBreakWindows = (timing) => {
  if (!timing?.start_time || !timing?.end_time) return null
  const breakMin = timing.break_duration ?? 0
  if (breakMin <= 0) return null
  const startSec = toSeconds(timing.start_time)
  const endSec = toSeconds(timing.end_time)
  return {
    before: `${secondsToClock(startSec)} – ${secondsToClock(startSec + breakMin * 60)}`,
    after: `${secondsToClock(endSec - breakMin * 60)} – ${secondsToClock(endSec)}`,
  }
}

const SERIAL_COL_WIDTH = 32
const NAME_COL_WIDTH   = 95
const LABEL_COL_WIDTH  = 68

export default function SubjectWisePreview({ subjects, periods, printRef, titleUrl, watermarkUrl }) {
  if (!subjects || subjects.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground py-12">
        No subject assignments found for the selected session.
      </p>
    )
  }

  const sortedPeriods  = periods && periods.length > 0 ? [...periods].sort((a, b) => a.period_number - b.period_number) : []
  const assemblyPeriod = sortedPeriods[0] ?? null
  const teachingSourcePeriods = sortedPeriods.length > 0 ? sortedPeriods.slice(1) : []

  const columns = teachingSourcePeriods.length > 0
    ? teachingSourcePeriods.map((p, idx) => ({ key: p.id, periodNumber: p.period_number, displayLabel: idx + 1, timings: p.timings }))
    : [...new Set(subjects.flatMap((s) => s.slots.map((sl) => sl.periodNumber)))]
        .sort((a, b) => a - b)
        .map((n, idx) => ({ key: n, periodNumber: n, displayLabel: idx + 1, timings: null }))

  const assemblyFd = assemblyPeriod?.timings?.find((t) => t.config === 'full_day')
  const assemblyFr = assemblyPeriod?.timings?.find((t) => t.config === 'half_day')

  // Each period's break can have a "before" window and an "after" window
  // (different classes in the same period may take the break at either end).
  // These are numbered as separate breaks in order — Break 1 is always a
  // "before" window, Break 2 an "after" window, and so on across periods —
  // rather than grouping before/after together under one break number.
  const breakWindowList = teachingSourcePeriods.flatMap((period) => {
    const fd = period.timings?.find((t) => t.config === 'full_day')
    const fr = period.timings?.find((t) => t.config === 'half_day')
    const fdWin = computeBreakWindows(fd)
    const frWin = computeBreakWindows(fr)
    if (!fdWin && !frWin) return []
    const windows = []
    if (fdWin?.before || frWin?.before) {
      windows.push({ key: `${period.id}-before`, fd: fdWin?.before, fr: frWin?.before })
    }
    if (fdWin?.after || frWin?.after) {
      windows.push({ key: `${period.id}-after`, fd: fdWin?.after, fr: frWin?.after })
    }
    return windows
  })

  return (
    <div ref={printRef} className="relative overflow-auto timetable-print-target">
      <PrintWatermark watermarkUrl={watermarkUrl} />

      <div className="relative z-10">
        <PrintHeader titleUrl={titleUrl} />

        {(assemblyPeriod || breakWindowList.length > 0) && (
          <div className="flex items-start justify-between gap-4 text-xs text-muted-foreground mb-2 flex-wrap">
            <p>
              {assemblyPeriod && (
                <>Assembly: {formatRange(assemblyFd)} (Friday: {formatRange(assemblyFr)})</>
              )}
            </p>
            {breakWindowList.length > 0 && (
              <p className="text-right">
                {breakWindowList.map((bw, i) => (
                  <span key={bw.key} className={i > 0 ? 'ml-3' : ''}>
                    Break {i + 1}: {bw.fd ?? '–'}{bw.fr && ` (Friday: ${bw.fr})`}
                  </span>
                ))}
              </p>
            )}
          </div>
        )}

        <table className="border-separate border-spacing-0 text-xs w-full">
          <thead className="sticky top-0 z-10 bg-muted">
            {/* Row 1 — S.No / Subject headers (span all 4 rows) + period labels */}
            <tr>
              <th
                rowSpan={4}
                style={{ width: SERIAL_COL_WIDTH, minWidth: SERIAL_COL_WIDTH }}
                className="sticky left-0 z-20 bg-muted border border-border px-1.5 py-1.5 text-center text-xs font-semibold align-top"
              >
                #
              </th>
              <th
                rowSpan={4}
                style={{ left: SERIAL_COL_WIDTH, width: NAME_COL_WIDTH, minWidth: NAME_COL_WIDTH }}
                className="sticky z-20 bg-muted border border-border px-3 py-1.5 text-left text-xs font-semibold align-top"
              >
                Subject
              </th>
              <th
                style={{ left: SERIAL_COL_WIDTH + NAME_COL_WIDTH, width: LABEL_COL_WIDTH, minWidth: LABEL_COL_WIDTH }}
                className="sticky z-20 bg-muted border border-border"
              />
              {columns.map((col) => (
                <th key={col.key} className="border border-border px-2 py-1 text-center font-semibold text-[10px]">
                  P{col.displayLabel}
                </th>
              ))}
            </tr>
            {/* Row 2 — Full Day start times (chained) */}
            <tr>
              <th
                style={{ left: SERIAL_COL_WIDTH + NAME_COL_WIDTH, width: LABEL_COL_WIDTH, minWidth: LABEL_COL_WIDTH }}
                className="sticky z-20 bg-muted border border-border px-2 py-1 text-left"
              >
                <span className="text-[10px] text-muted-foreground font-medium">Full Day</span>
              </th>
              {columns.map((col) => {
                const fdTiming = col.timings?.find((t) => t.config === 'full_day')
                return (
                  <th key={col.key} className="border border-border px-2 py-1 text-center font-semibold text-[10px]">
                    {formatTimeShort(fdTiming?.end_time) ?? '–'}
                  </th>
                )
              })}
            </tr>
            {/* Row 3 — Friday start times */}
            <tr>
              <th
                style={{ left: SERIAL_COL_WIDTH + NAME_COL_WIDTH, width: LABEL_COL_WIDTH, minWidth: LABEL_COL_WIDTH }}
                className="sticky z-20 bg-muted border border-border px-2 py-1 text-left"
              >
                <span className="text-[10px] text-muted-foreground font-medium">Friday</span>
              </th>
              {columns.map((col) => {
                const hdTiming = col.timings?.find((t) => t.config === 'half_day')
                return (
                  <th key={col.key} className="border border-border px-2 py-1 text-center text-[10px] text-muted-foreground font-normal">
                    {formatTimeShort(hdTiming?.end_time) ?? '–'}
                  </th>
                )
              })}
            </tr>
            {/* Row 4 — Interval / Duration */}
            <tr>
              <th
                style={{ left: SERIAL_COL_WIDTH + NAME_COL_WIDTH, width: LABEL_COL_WIDTH, minWidth: LABEL_COL_WIDTH }}
                className="sticky z-20 bg-muted border border-border px-2 py-0.5 text-left"
              >
                <span className="text-[10px] text-muted-foreground font-medium">Interval</span>
              </th>
              {columns.map((col) => {
                const fdTiming = col.timings?.find((t) => t.config === 'full_day')
                const hdTiming = col.timings?.find((t) => t.config === 'half_day')
                return (
                  <th className="border border-border px-1.5 py-0.5 text-center text-[10px] text-muted-foreground font-normal">
                    <div className="flex items-center justify-center gap-1.5">
                      <span>{formatDuration(fdTiming)}</span>
                      <span className="text-muted-foreground/60">{formatDuration(hdTiming)}</span>
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>

          <tbody>
            {subjects.map((subject, idx) => (
              <tr key={subject.id}>
                <td
                  style={{ width: SERIAL_COL_WIDTH, minWidth: SERIAL_COL_WIDTH }}
                  className="sticky left-0 z-10 bg-muted border border-border px-1.5 py-2 text-center text-xs align-top"
                >
                  {idx + 1}
                </td>
                <td
                  style={{ left: SERIAL_COL_WIDTH, width: NAME_COL_WIDTH, minWidth: NAME_COL_WIDTH }}
                  className="sticky z-10 bg-muted border border-border px-3 py-2 whitespace-nowrap text-xs align-top"
                >
                  <div className="font-medium text-foreground">{subject.name}</div>
                  {subject.name_initials && (
                    <div className="text-muted-foreground text-[10px]">{subject.name_initials}</div>
                  )}
                </td>
                {/* Total periods for this subject — lives in the label column */}
                <td
                  style={{ left: SERIAL_COL_WIDTH + NAME_COL_WIDTH, width: LABEL_COL_WIDTH, minWidth: LABEL_COL_WIDTH }}
                  className="sticky z-10 bg-muted border border-border text-center text-xs font-semibold"
                >
                  {subject.slots.length}
                </td>

                {columns.map((col) => {
                  const entries = subject.slots.filter((sl) => sl.periodNumber === col.periodNumber)

                  const fdTiming = col.timings?.find((t) => t.config === 'full_day')
                  const hasBreak = (fdTiming?.break_duration ?? 0) > 0

                  const entryBreakPosition = (entry) =>
                    (entry?.breakPosition === 'before' || entry?.breakPosition === 'after') && hasBreak
                      ? entry.breakPosition
                      : null

                  const BreakStrip = ({ side }) => (
                    <div
                      className={
                        side === 'before'
                          ? 'w-4 bg-amber-500/10 border-r border-amber-500/40 flex items-center justify-center shrink-0'
                          : 'w-4 bg-blue-500/10 border-l border-blue-500/40 flex items-center justify-center shrink-0'
                      }
                    >
                      <span
                        className={
                          (side === 'before'
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-blue-600 dark:text-blue-400') +
                          ' text-[8px] rotate-90 whitespace-nowrap'
                        }
                      >
                        Break
                      </span>
                    </div>
                  )

                  if (entries.length === 0) {
                    return (
                      <td key={col.key} className="border border-border p-1.5 align-top text-xs">
                        <span className="text-muted-foreground italic select-none">—</span>
                      </td>
                    )
                  }

                  if (entries.length === 1) {
                    // Single entry — same full-height break strip treatment as
                    // Class-wise/Staff-wise (strip runs the whole cell height).
                    const entry = entries[0]
                    const breakPosition = entryBreakPosition(entry)
                    const content = (
                      <div className="py-0.5">
                        <p className="font-medium text-foreground leading-tight">
                          <ClassLabel classGroupName={entry.classGroupName} sectionName={entry.sectionName} />
                        </p>
                        <p className="text-muted-foreground/80 leading-tight">
                          {entry.staff?.name_initials ?? withMr(entry.staff?.full_name) ?? '—'}
                        </p>
                      </div>
                    )
                    return (
                      <td key={col.key} className="border border-border align-top text-xs relative">
                        {breakPosition ? (
                          <div className="absolute inset-0 flex min-h-[48px]">
                            {breakPosition === 'before' && <BreakStrip side="before" />}
                            <div className="flex-1 p-1.5">{content}</div>
                            {breakPosition === 'after' && <BreakStrip side="after" />}
                          </div>
                        ) : (
                          <div className="p-1.5 min-h-[48px]">{content}</div>
                        )}
                      </td>
                    )
                  }

                  // Multiple entries stacked in one cell — each entry gets its
                  // own inline strip beside it, since entries don't share a
                  // single row height the way the single-entry case does.
                  return (
                    <td key={col.key} className="border border-border align-top text-xs p-0">
                      {entries.map((entry, i) => {
                        const breakPosition = entryBreakPosition(entry)
                        const content = (
                          <div className="px-1.5 py-0.5">
                            <p className="font-medium text-foreground leading-tight">
                              <ClassLabel classGroupName={entry.classGroupName} sectionName={entry.sectionName} />
                            </p>
                            <p className="text-muted-foreground/80 leading-tight">
                              {entry.staff?.name_initials ?? withMr(entry.staff?.full_name) ?? '—'}
                            </p>
                          </div>
                        )
                        return (
                          <div
                            key={i}
                            className={
                              (i > 0 ? 'border-t border-border/40 ' : '') +
                              (breakPosition ? 'flex' : '')
                            }
                          >
                            {breakPosition === 'before' && <BreakStrip side="before" />}
                            {breakPosition ? <div className="flex-1">{content}</div> : content}
                            {breakPosition === 'after' && <BreakStrip side="after" />}
                          </div>
                        )
                      })}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}