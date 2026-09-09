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

// Column widths for the two sticky left columns — the entity name column and
// the Full Day/Friday/Interval label column right after it. Kept as plain
// numbers (not Tailwind arbitrary values) so the label column's sticky
// `left` offset reliably matches the name column's width.
const NAME_COL_WIDTH  = 110
const LABEL_COL_WIDTH = 68

export default function ClassWisePreview({ periods, rows, printRef, titleUrl, watermarkUrl }) {
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
                Class / Section
              </th>
              <th
                style={{ left: NAME_COL_WIDTH, width: LABEL_COL_WIDTH, minWidth: LABEL_COL_WIDTH }}
                className="sticky z-20 bg-muted border border-border px-2 py-1 text-left"
              >
                <span className="text-[10px] text-muted-foreground font-medium">Full Day</span>
              </th>
              {periods.map((period) => {
                const fdTiming = period.timings?.find((t) => t.config === 'full_day')
                return (
                  <th key={period.id} className="border border-border px-2 py-1 text-center font-semibold text-[10px]">
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
              {periods.map((period) => {
                const hdTiming = period.timings?.find((t) => t.config === 'half_day')
                return (
                  <th key={period.id} className="border border-border px-2 py-1 text-center text-[10px] text-muted-foreground font-normal">
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
              {periods.map((period) => {
                const fdTiming = period.timings?.find((t) => t.config === 'full_day')
                const hdTiming = period.timings?.find((t) => t.config === 'half_day')
                return (
                  <th key={period.id} className="border border-border px-2 py-1 text-center text-[10px] text-muted-foreground font-normal leading-tight">
                    <div>{formatDuration(fdTiming)}</div>
                    <div className="text-muted-foreground/70">{formatDuration(hdTiming)}</div>
                  </th>
                )
              })}
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => {
              const rowSlotCount = periods.filter((period) => {
                const slot = period.slots?.find(
                  (s) => s.class_group_id === row.classGroupId && s.section_id === row.sectionId,
                )
                return slot && (slot.subject_id_1 || slot.staff_id_1 || slot.staff_id_2 || slot.label)
              }).length

              return (
                <tr key={`${row.classGroupId}-${row.sectionId}`}>
                  <td
                    style={{ width: NAME_COL_WIDTH, minWidth: NAME_COL_WIDTH }}
                    className="sticky left-0 z-10 bg-muted border border-border px-3 py-2 font-medium whitespace-nowrap text-xs align-top"
                  >
                    {row.classGroupName}
                    {row.sectionName && (
                      <span className="text-muted-foreground ml-1 font-normal">{row.sectionName}</span>
                    )}
                  </td>
                  {/* Filler cell — keeps column count aligned with the label column in
                      the header; carries no content of its own for data rows. */}
                  <td
                    style={{ left: NAME_COL_WIDTH, width: LABEL_COL_WIDTH, minWidth: LABEL_COL_WIDTH }}
                    className="sticky z-10 bg-muted border border-border"
                  />

                  {periods.map((period) => {
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
                      <div className="space-y-0.5">
                        {slotLabel && <p className="font-medium text-foreground leading-tight">{slotLabel}</p>}
                        {pairLines.map((line, i) => (
                          <p key={i} className="text-muted-foreground/80 leading-tight">
                            {line.subject}
                            {line.subject && line.staff && ' · '}
                            {line.staff}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic select-none">—</span>
                    )

                    return (
                      <td key={period.id} className="border border-border align-top relative">
                        {breakPosition ? (
                          <div className="absolute inset-0 flex min-h-[56px]">
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
                          <div className="p-1.5 min-h-[56px]">{contentNode}</div>
                        )}
                      </td>
                    )
                  })}

                  <td className="border border-border text-center text-xs font-semibold">
                    {rowSlotCount}
                  </td>
                </tr>
              )
            })}

            {rows.length === 0 && (
              <tr>
                <td colSpan={periods.length + 3} className="text-center py-12 text-muted-foreground italic text-sm">
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