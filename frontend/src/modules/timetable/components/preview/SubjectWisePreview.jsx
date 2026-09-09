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

// Only applied when falling back to a staff member's full name (initials are
// left as-is, since "Mr. H.A.K." would read oddly).
const withMr = (fullName) => (fullName ? `Mr. ${fullName}` : fullName)

// Column widths for the two sticky left columns — the entity name column and
// the Full Day/Friday/Interval label column right after it. Kept as plain
// numbers (not Tailwind arbitrary values) so the label column's sticky
// `left` offset reliably matches the name column's width.
const NAME_COL_WIDTH  = 110
const LABEL_COL_WIDTH = 68

export default function SubjectWisePreview({ subjects, periods, printRef, titleUrl, watermarkUrl }) {
  if (!subjects || subjects.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground py-12">
        No subject assignments found for the selected session.
      </p>
    )
  }

  const columns = periods && periods.length > 0
    ? periods.map((p) => ({ key: p.id, periodNumber: p.period_number, timings: p.timings }))
    : [...new Set(subjects.flatMap((s) => s.slots.map((sl) => sl.periodNumber)))]
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
                Subject
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
            {subjects.map((subject) => (
              <tr key={subject.id}>
                <td
                  style={{ width: NAME_COL_WIDTH, minWidth: NAME_COL_WIDTH }}
                  className="sticky left-0 z-10 bg-muted border border-border px-3 py-2 whitespace-nowrap text-xs align-top"
                >
                  <div className="font-medium text-foreground">{subject.name}</div>
                  {subject.name_initials && (
                    <div className="text-muted-foreground text-[10px]">{subject.name_initials}</div>
                  )}
                </td>
                {/* Filler cell — keeps column count aligned with the label column in
                    the header; carries no content of its own for data rows. */}
                <td
                  style={{ left: NAME_COL_WIDTH, width: LABEL_COL_WIDTH, minWidth: LABEL_COL_WIDTH }}
                  className="sticky z-10 bg-muted border border-border"
                />

                {columns.map((col) => {
                  const entries = subject.slots.filter((sl) => sl.periodNumber === col.periodNumber)

                  return (
                    <td key={col.key} className="border border-border p-1.5 align-top text-xs">
                      {entries.length === 0 ? (
                        <span className="text-muted-foreground italic select-none">—</span>
                      ) : (
                        <div>
                          {entries.map((entry, i) => (
                            <div
                              key={i}
                              className={i > 0 ? 'border-t border-border/40 py-0.5' : 'py-0.5'}
                            >
                              <p className="font-medium text-foreground leading-tight">
                                {entry.classGroupName}
                                {entry.sectionName && <span> · {entry.sectionName}</span>}
                              </p>
                              <p className="text-muted-foreground/80 leading-tight">
                                {entry.staff?.name_initials ?? withMr(entry.staff?.full_name) ?? '—'}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  )
                })}

                <td className="border border-border text-center text-xs font-semibold">
                  {subject.slots.length}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}