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
    ? teachingSourcePeriods.map((p) => ({ key: p.id, periodNumber: p.period_number, timings: p.timings }))
    : [...new Set(subjects.flatMap((s) => s.slots.map((sl) => sl.periodNumber)))]
        .sort((a, b) => a - b)
        .map((n) => ({ key: n, periodNumber: n, timings: null }))

  const assemblyFd = assemblyPeriod?.timings?.find((t) => t.config === 'full_day')
  const assemblyFr = assemblyPeriod?.timings?.find((t) => t.config === 'half_day')

  return (
    <div ref={printRef} className="relative overflow-auto timetable-print-target">
      <PrintWatermark watermarkUrl={watermarkUrl} />

      <div className="relative z-10">
        <PrintHeader titleUrl={titleUrl} />

        {assemblyPeriod && (
          <p className="text-xs text-muted-foreground mb-2">
            Assembly: {formatRange(assemblyFd)} (Friday: {formatRange(assemblyFr)})
          </p>
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
                  P{col.periodNumber}
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
                    {formatTimeShort(fdTiming?.start_time) ?? '–'}
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
                    {formatTimeShort(hdTiming?.start_time) ?? '–'}
                  </th>
                )
              })}
            </tr>
            {/* Row 4 — Interval / Duration */}
            <tr>
              <th
                style={{ left: SERIAL_COL_WIDTH + NAME_COL_WIDTH, width: LABEL_COL_WIDTH, minWidth: LABEL_COL_WIDTH }}
                className="sticky z-20 bg-muted border border-border px-2 py-1 text-left"
              >
                <span className="text-[10px] text-muted-foreground font-medium">Interval</span>
              </th>
              {columns.map((col) => {
                const fdTiming = col.timings?.find((t) => t.config === 'full_day')
                const hdTiming = col.timings?.find((t) => t.config === 'half_day')
                return (
                  <th className="border border-border px-2 py-1 text-center text-[10px] text-muted-foreground font-normal">
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
                                <ClassLabel classGroupName={entry.classGroupName} sectionName={entry.sectionName} />
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}