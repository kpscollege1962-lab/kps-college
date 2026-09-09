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

// Builds a "SUBJ1 / SUBJ2" label from whichever subject(s) are present on an
// entry. A staff member may be tagged as staff_id_1 (subject1 only),
// staff_id_2 (subject2 only), or both (subject1 + subject2) — so this must
// not assume subject1 is always populated.
const buildSubjectLine = (entry) => {
  if (!entry) return null
  const parts = [entry.subject1, entry.subject2]
    .filter(Boolean)
    .map((s) => s.name_initials ?? s.name)
  return parts.length > 0 ? parts.join(' / ') : null
}

// Staff-wise preview lists teachers formally — prefix every full name with
// "Mr." (this campus's staff list is all-male). Names already shown as
// initials elsewhere are left as-is.
const withMr = (fullName) => (fullName ? `Mr. ${fullName}` : fullName)

// Column widths for the two sticky left columns — the entity name column and
// the Full Day/Friday/Interval label column right after it. Kept as plain
// numbers (not Tailwind arbitrary values) so the label column's sticky
// `left` offset reliably matches the name column's width.
const NAME_COL_WIDTH  = 110
const LABEL_COL_WIDTH = 68

export default function StaffWisePreview({ staff, periods, printRef, titleUrl, watermarkUrl }) {
  if (!staff || staff.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground py-12">
        No staff assignments found for the selected session.
      </p>
    )
  }

  // Note: seniority ordering (most senior first) is applied server-side by
  // timetablePreview.service.js — this component just renders `staff` in
  // whatever order it arrives in.
  const columns = periods && periods.length > 0
    ? periods.map((p) => ({ key: p.id, periodNumber: p.period_number, timings: p.timings }))
    : [...new Set(staff.flatMap((s) => s.slots.map((sl) => sl.periodNumber)))]
        .sort((a, b) => a - b)
        .map((n) => ({ key: n, periodNumber: n, timings: null }))

  return (
    <div ref={printRef} className="relative overflow-auto timetable-print-target">
      <PrintWatermark watermarkUrl={watermarkUrl} />

      <div className="relative z-10">
        <PrintHeader titleUrl={titleUrl} />

        <table className="border-separate border-spacing-0 text-xs w-full">
          <thead className="sticky top-0 z-10 bg-muted">
            {/* Row 1 — entity column header (spans all 3 rows) + Full Day timings */}
            <tr>
              <th
                rowSpan={3}
                style={{ width: NAME_COL_WIDTH, minWidth: NAME_COL_WIDTH }}
                className="sticky left-0 z-20 bg-muted border border-border px-3 py-1.5 text-left text-xs font-semibold align-top"
              >
                Staff
              </th>
              <th
                style={{ left: NAME_COL_WIDTH, width: LABEL_COL_WIDTH, minWidth: LABEL_COL_WIDTH }}
                className="sticky z-20 bg-muted border border-border px-2 py-1 text-left"
              >
                <span className="text-[10px] text-muted-foreground font-medium">Full Day</span>
              </th>
              {columns.map((col) => {
                const fdTiming = col.timings?.find((t) => t.config === 'full_day')
                return (
                  <th key={col.key} className="border border-border px-2 py-1 text-center font-semibold text-[10px]">
                    {formatRange(fdTiming)}
                  </th>
                )
              })}
              <th rowSpan={3} className="border border-border px-2 py-1.5 text-center font-semibold min-w-[48px]">
                Total
              </th>
            </tr>
            {/* Row 2 — Friday (half day) timings */}
            <tr>
              <th
                style={{ left: NAME_COL_WIDTH, width: LABEL_COL_WIDTH, minWidth: LABEL_COL_WIDTH }}
                className="sticky z-20 bg-muted border border-border px-2 py-1 text-left"
              >
                <span className="text-[10px] text-muted-foreground font-medium">Friday</span>
              </th>
              {columns.map((col) => {
                const hdTiming = col.timings?.find((t) => t.config === 'half_day')
                return (
                  <th key={col.key} className="border border-border px-2 py-1 text-center text-[10px] text-muted-foreground font-normal">
                    {formatRange(hdTiming)}
                  </th>
                )
              })}
            </tr>
            {/* Row 3 — Interval / Duration */}
            <tr>
              <th
                style={{ left: NAME_COL_WIDTH, width: LABEL_COL_WIDTH, minWidth: LABEL_COL_WIDTH }}
                className="sticky z-20 bg-muted border border-border px-2 py-1 text-left"
              >
                <span className="text-[10px] text-muted-foreground font-medium">Interval</span>
              </th>
              {columns.map((col) => {
                const fdTiming = col.timings?.find((t) => t.config === 'full_day')
                const hdTiming = col.timings?.find((t) => t.config === 'half_day')
                return (
                  <th key={col.key} className="border border-border px-2 py-1 text-center text-[10px] text-muted-foreground font-normal leading-tight">
                    <div>{formatDuration(fdTiming)}</div>
                    <div className="text-muted-foreground/70">{formatDuration(hdTiming)}</div>
                  </th>
                )
              })}
            </tr>
          </thead>

          <tbody>
            {staff.map((member) => (
              <tr key={member.id}>
                <td
                  style={{ width: NAME_COL_WIDTH, minWidth: NAME_COL_WIDTH }}
                  className="sticky left-0 z-10 bg-muted border border-border px-3 py-2 whitespace-nowrap text-xs align-top"
                >
                  <div className="font-medium text-foreground">{withMr(member.full_name)}</div>
                  {member.name_initials && (
                    <div className="text-muted-foreground text-[10px]">{member.name_initials}</div>
                  )}
                </td>
                {/* Filler cell — keeps column count aligned with the label column in
                    the header; carries no content of its own for data rows. */}
                <td
                  style={{ left: NAME_COL_WIDTH, width: LABEL_COL_WIDTH, minWidth: LABEL_COL_WIDTH }}
                  className="sticky z-10 bg-muted border border-border"
                />

                {columns.map((col) => {
                  const entries = member.slots.filter((sl) => sl.periodNumber === col.periodNumber)

                  if (entries.length > 1) {
                    // If every class in this period shares the same label (e.g. all
                    // "DRILL"), it's one period-wide activity, not a separate thing
                    // per class — show it once below the class list instead of
                    // repeating it under each one.
                    const sharedLabel = entries.every((e) => e.label && e.label === entries[0].label)
                      ? entries[0].label
                      : null

                    return (
                      <td key={col.key} className="border border-border p-1.5 align-top text-xs">
                        <div>
                          {entries.map((entry, i) => {
                            const entrySubjectLine = buildSubjectLine(entry)
                            return (
                              <div
                                key={i}
                                className={i > 0 ? 'border-t border-border/40 py-0.5' : 'py-0.5'}
                              >
                                <p className="font-medium text-foreground leading-tight">
                                  {entry.classGroupName}
                                  {entry.sectionName && <span> · {entry.sectionName}</span>}
                                </p>
                                {entry.label && !sharedLabel && (
                                  <p className="text-muted-foreground/80 leading-tight">{entry.label}</p>
                                )}
                                {entrySubjectLine && (
                                  <p className="text-muted-foreground/80 leading-tight">{entrySubjectLine}</p>
                                )}
                              </div>
                            )
                          })}
                          {sharedLabel && (
                            <p className="text-muted-foreground/80 leading-tight border-t border-border/40 pt-0.5 mt-0.5">
                              {sharedLabel}
                            </p>
                          )}
                        </div>
                      </td>
                    )
                  }

                  const slot = entries[0] ?? null
                  const subjectLine = buildSubjectLine(slot)

                  const fdTiming = col.timings?.find((t) => t.config === 'full_day')
                  const hasBreak = (fdTiming?.break_duration ?? 0) > 0
                  const breakPosition =
                    (slot?.breakPosition === 'before' || slot?.breakPosition === 'after') && hasBreak
                      ? slot.breakPosition
                      : null

                  const contentNode = slot ? (
                    <div className="space-y-0.5">
                      <p className="font-medium text-foreground leading-tight">
                        {slot.classGroupName}
                        {slot.sectionName && <span> · {slot.sectionName}</span>}
                      </p>
                      {slot.label && (
                        <p className="text-muted-foreground/80 leading-tight">{slot.label}</p>
                      )}
                      {subjectLine && (
                        <p className="text-muted-foreground/80 leading-tight">{subjectLine}</p>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground italic select-none">—</span>
                  )

                  return (
                    <td key={col.key} className="border border-border align-top text-xs relative">
                      {breakPosition ? (
                        <div className="absolute inset-0 flex min-h-[48px]">
                          {breakPosition === 'before' && (
                            <div className="w-6 bg-amber-500/10 border-r border-amber-500/40 flex items-center justify-center shrink-0">
                              <span className="text-[9px] text-amber-600 dark:text-amber-400 rotate-90 whitespace-nowrap">
                                Break
                              </span>
                            </div>
                          )}
                          <div className="flex-1 p-1.5">
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
                        <div className="p-1.5 min-h-[48px]">{contentNode}</div>
                      )}
                    </td>
                  )
                })}

                <td className="border border-border text-center text-xs font-semibold">
                  {member.slots.length}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}