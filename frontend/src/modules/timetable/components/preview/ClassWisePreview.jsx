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

const TimingRow = ({ timing }) => {
  const start = formatTimeShort(timing?.start_time)
  const end   = formatTimeShort(timing?.end_time)

  if (!start || !end) {
    return (
      <div className="text-[10px] text-muted-foreground font-normal">–</div>
    )
  }

  const totalMin = Math.round((toSeconds(timing.end_time) - toSeconds(timing.start_time)) / 60)
  const breakMin = (timing.break_duration ?? 0) > 0 ? timing.break_duration : null
  const instrMin = breakMin != null ? totalMin - breakMin : totalMin

  const durationDisplay = breakMin != null
    ? `${instrMin}|${breakMin}min`
    : `${instrMin}min`

  return (
    <div className="text-[10px] text-muted-foreground font-normal leading-tight">
      <div>{start}</div>
      <div>{end}</div>
      <div>{durationDisplay}</div>
    </div>
  )
}

export default function ClassWisePreview({ periods, rows, printRef, titleUrl, monogramUrl, watermarkUrl }) {
  return (
    <div ref={printRef} className="relative overflow-auto timetable-print-target">
      <PrintWatermark watermarkUrl={watermarkUrl} />

      <div className="relative z-10">
        <PrintHeader titleUrl={titleUrl} monogramUrl={monogramUrl} />

        <table className="border-separate border-spacing-0 text-xs w-full">
          <thead className="sticky top-0 z-10 bg-muted">
            <tr>
              <th className="sticky left-0 z-20 bg-muted border border-border px-3 py-1.5 text-left min-w-[95px] text-xs font-semibold">
                Class / Section
              </th>
              {periods.map((period) => {
                const fdTiming = period.timings?.find((t) => t.config === 'full_day')
                const hdTiming = period.timings?.find((t) => t.config === 'half_day')
                return (
                  <th
                    key={period.id}
                    className="border border-border px-2 py-1.5 text-center font-semibold"
                  >
                    <div className="border-b border-border/50 pb-0.5 mb-0.5">
                      <TimingRow timing={fdTiming} />
                    </div>
                    <TimingRow timing={hdTiming} />
                  </th>
                )
              })}
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={`${row.classGroupId}-${row.sectionId}`}>
                <td className="sticky left-0 z-10 bg-muted border border-border px-3 py-2 font-medium whitespace-nowrap text-xs">
                  {row.classGroupName}
                  {row.sectionName && (
                    <span className="text-muted-foreground ml-1 font-normal">{row.sectionName}</span>
                  )}
                </td>

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
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={periods.length + 1} className="text-center py-12 text-muted-foreground italic text-sm">
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