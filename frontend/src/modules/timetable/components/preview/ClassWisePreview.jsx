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
  return breakMin != null ? `${instrMin}|${breakMin}` : `${instrMin}`
}

// Full range, used only for the one-off Assembly note (it has no adjacent
// column to imply its end time the way the main grid's periods do).
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

// Renders "7 EAGLE" as "7ᵗʰ E" (abbreviated) or "7ᵗʰ EAGLE" (full) depending
// on context — the row label in Class-wise shows the full name, but cells
// inside Staff-wise/Subject-wise (and anywhere else referencing a class)
// stay abbreviated to save space.
// Assumption: first-letter abbreviation (Eagle→E, Falcon→F). If two class
// names ever share a first letter, this will collide — worth a custom
// abbreviation map at that point instead of first-letter-only.
const ClassLabel = ({ classGroupName, sectionName, abbreviate = true }) => {
  const n = parseInt(classGroupName, 10)
  const numberPart = Number.isNaN(n)
    ? classGroupName
    : <>{n}<sup className="text-[0.65em]">{ordinalSuffix(n)}</sup></>
  const sectionDisplay = sectionName
    ? (abbreviate ? sectionName.charAt(0).toUpperCase() : sectionName)
    : null
  return <>{numberPart}{sectionDisplay && <span className="ml-0.5">{sectionDisplay}</span>}</>
}

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
const NAME_COL_WIDTH   = 78
const LABEL_COL_WIDTH  = 44

export default function ClassWisePreview({ periods, rows, printRef, titleUrl, watermarkUrl }) {
  // The first period (by period_number) is Assembly — every class shows "—"
  // for it, so instead of a whole column of dashes, its timing is mentioned
  // once in a note above the table and it's excluded from the main columns.
  const sortedPeriods    = [...periods].sort((a, b) => a.period_number - b.period_number)
  const assemblyPeriod   = sortedPeriods[0] ?? null
  const teachingPeriods  = sortedPeriods.slice(1)

  const assemblyFd = assemblyPeriod?.timings?.find((t) => t.config === 'full_day')
  const assemblyFr = assemblyPeriod?.timings?.find((t) => t.config === 'half_day')

  // Each period's break can have a "before" window and an "after" window
  // (different classes in the same period may take the break at either end).
  // These are numbered as separate breaks in order — Break 1 is always a
  // "before" window, Break 2 an "after" window, and so on across periods —
  // rather than grouping before/after together under one break number.
  const breakWindowList = teachingPeriods.flatMap((period) => {
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

        {/* Assembly note (left) / page title (centered, absolute so it stays
            truly centered regardless of how wide the left/right text is) /
            break notes (right). Always rendered — even with no assembly or
            break data configured, the bold title still needs to show. */}
        <div className="relative flex items-start justify-between gap-4 text-xs text-muted-foreground mb-2 flex-wrap min-h-[18px]">
          <p>
            {assemblyPeriod && (
              <>Assembly: {formatRange(assemblyFd)} (Friday: {formatRange(assemblyFr)})</>
            )}
          </p>
          <p className="absolute left-1/2 top-0 -translate-x-1/2 font-bold text-lg text-foreground whitespace-nowrap">
            CLASS WISE PERIOD DISTRIBUTION
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

        <table className="border-separate border-spacing-0 text-xs w-full">
          <thead className="sticky top-0 z-10 bg-muted">
            {/* Row 1 — S.No / Class / Section headers (span all 4 rows) + period labels */}
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
                Class / Section
              </th>
              <th
                style={{ left: SERIAL_COL_WIDTH + NAME_COL_WIDTH, width: LABEL_COL_WIDTH, minWidth: LABEL_COL_WIDTH }}
                className="sticky z-20 bg-muted border border-border"
              />
              {teachingPeriods.map((period, idx) => (
                <th key={period.id} className="border border-border px-2 py-1 text-center font-semibold text-[10px]">
                  P{idx + 1}
                </th>
              ))}
            </tr>
            {/* Row 2 — Full Day end times (chained: this column's value is also the next period's start) */}
            <tr>
              <th
                style={{ left: SERIAL_COL_WIDTH + NAME_COL_WIDTH, width: LABEL_COL_WIDTH, minWidth: LABEL_COL_WIDTH }}
                className="sticky z-20 bg-muted border border-border px-1.5 py-1 text-left"
              >
                <span className="text-[10px] text-muted-foreground font-medium">Full Day</span>
              </th>
              {teachingPeriods.map((period) => {
                const fdTiming = period.timings?.find((t) => t.config === 'full_day')
                return (
                  <th key={period.id} className="border border-border px-2 py-1 text-center font-semibold text-[10px]">
                    {formatTimeShort(fdTiming?.end_time) ?? '–'}
                  </th>
                )
              })}
            </tr>
            {/* Row 3 — Friday end times */}
            <tr>
              <th
                style={{ left: SERIAL_COL_WIDTH + NAME_COL_WIDTH, width: LABEL_COL_WIDTH, minWidth: LABEL_COL_WIDTH }}
                className="sticky z-20 bg-muted border border-border px-1.5 py-1 text-left"
              >
                <span className="text-[10px] text-muted-foreground font-medium">Friday</span>
              </th>
              {teachingPeriods.map((period) => {
                const hdTiming = period.timings?.find((t) => t.config === 'half_day')
                return (
                  <th key={period.id} className="border border-border px-2 py-1 text-center text-[10px] text-muted-foreground font-normal">
                    {formatTimeShort(hdTiming?.end_time) ?? '–'}
                  </th>
                )
              })}
            </tr>
            {/* Row 4 — Interval / Duration */}
            <tr>
              <th
                style={{ left: SERIAL_COL_WIDTH + NAME_COL_WIDTH, width: LABEL_COL_WIDTH, minWidth: LABEL_COL_WIDTH }}
                className="sticky z-20 bg-muted border border-border px-1.5 py-0.5 text-left"
              >
                <span className="text-[10px] text-muted-foreground font-medium">Interval</span>
              </th>
              {teachingPeriods.map((period) => {
                const fdTiming = period.timings?.find((t) => t.config === 'full_day')
                const hdTiming = period.timings?.find((t) => t.config === 'half_day')
                return (
                  <th className="border border-border px-1.5 py-0.5 text-center text-[10px] text-muted-foreground font-normal">
                    <div className="flex items-center justify-between">
                      <span>{formatDuration(fdTiming)}</span>
                      <span className="text-muted-foreground/60">{formatDuration(hdTiming)}</span>
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, idx) => {
              const rowSlotCount = teachingPeriods.filter((period) => {
                const slot = period.slots?.find(
                  (s) => s.class_group_id === row.classGroupId && s.section_id === row.sectionId,
                )
                return slot && (slot.subject_id_1 || slot.staff_id_1 || slot.staff_id_2 || slot.label)
              }).length

              return (
                <tr key={`${row.classGroupId}-${row.sectionId}`}>
                  <td
                    style={{ width: SERIAL_COL_WIDTH, minWidth: SERIAL_COL_WIDTH }}
                    className="sticky left-0 z-10 bg-muted border border-border px-1.5 py-2 text-center text-xs align-top"
                  >
                    {idx + 1}
                  </td>
                  <td
                    style={{ left: SERIAL_COL_WIDTH, width: NAME_COL_WIDTH, minWidth: NAME_COL_WIDTH }}
                    className="sticky z-10 bg-muted border border-border px-3 py-2 font-medium whitespace-nowrap text-xs align-top"
                  >
                    <ClassLabel classGroupName={row.classGroupName} sectionName={row.sectionName} abbreviate={false} />
                  </td>
                  {/* Total periods for this row — lives in the previously-blank label column */}
                  <td
                    style={{ left: SERIAL_COL_WIDTH + NAME_COL_WIDTH, width: LABEL_COL_WIDTH, minWidth: LABEL_COL_WIDTH }}
                    className="sticky z-10 bg-muted border border-border text-center text-xs font-semibold"
                  >
                    {rowSlotCount}
                  </td>

                  {teachingPeriods.map((period) => {
                    const slot = period.slots?.find(
                      (s) => s.class_group_id === row.classGroupId && s.section_id === row.sectionId,
                    ) ?? null

                    const hasContent = slot && (slot.subject_id_1 || slot.staff_id_1 || slot.staff_id_2 || slot.label)
                    const slotLabel  = slot?.label || null

                    const subject1Initials = slot?.subject1 ? (slot.subject1.name_initials || slot.subject1.name) : null
                    const subject2Initials = slot?.subject2 ? (slot.subject2.name_initials || slot.subject2.name) : null
                    const staff1Initials   = slot?.staff1   ? (slot.staff1.name_initials   || slot.staff1.full_name)   : null
                    const staff2Initials   = slot?.staff2   ? (slot.staff2.name_initials   || slot.staff2.full_name)   : null

                    const pairLines = []
                    if (subject1Initials || staff1Initials) {
                      pairLines.push({ subject: subject1Initials, staff: staff1Initials })
                    }
                    if (subject2Initials || staff2Initials) {
                      pairLines.push({ subject: subject2Initials, staff: staff2Initials })
                    }

                    const fdTiming = period.timings?.find((t) => t.config === 'full_day')
                    const hasBreak = fdTiming?.break_duration > 0
                    const breakPosition = (slot?.break_position === 'before' || slot?.break_position === 'after') && hasBreak
                      ? slot.break_position
                      : null

                    const contentNode = hasContent ? (
                      <div className="space-y-0.5 text-center">
                        {slotLabel && <p className="font-medium text-foreground leading-tight">{slotLabel}</p>}
                        {pairLines.map((line, i) => (
                          <p key={i} className="text-foreground leading-tight">
                            {line.subject}
                            {line.subject && line.staff && ' · '}
                            {line.staff}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <span className="text-foreground italic select-none">—</span>
                    )

                    return (
                      <td key={period.id} className="border border-border align-top text-center relative">
                        {breakPosition ? (
                          <div className="absolute inset-0 flex min-h-[56px]">
                            {breakPosition === 'before' && (
                              <div className="w-6 bg-amber-500/10 border-r border-amber-500/40 flex items-center justify-center shrink-0">
                                <span className="text-[9px] text-amber-600 dark:text-amber-400 rotate-90 whitespace-nowrap">
                                  Break
                                </span>
                              </div>
                            )}
                            <div className="flex-1 p-1.5 flex items-center justify-center">
                              {contentNode}
                            </div>
                            {breakPosition === 'after' && (
                              <div className="w-6 bg-blue-500/10 border-l border-blue-500/40 flex items-center justify-center shrink-0">
                                <span className="text-[9px] text-blue-600 dark:text-blue-400 rotate-90 whitespace-nowrap">
                                  Break
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-1.5 min-h-[56px] flex items-center justify-center">{contentNode}</div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}

            {rows.length === 0 && (
              <tr>
                <td colSpan={teachingPeriods.length + 3} className="text-center py-12 text-muted-foreground italic text-sm">
                  No classes found for the selected session.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}