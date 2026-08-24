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

export default function StaffWisePreview({ staff, periods, printRef }) {
  if (!staff || staff.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground py-12">
        No staff assignments found for the selected session.
      </p>
    )
  }

  const columns = periods && periods.length > 0
    ? periods.map((p) => ({ key: p.id, periodNumber: p.period_number, timings: p.timings }))
    : [...new Set(staff.flatMap((s) => s.slots.map((sl) => sl.periodNumber)))]
        .sort((a, b) => a - b)
        .map((n) => ({ key: n, periodNumber: n, timings: null }))

  return (
    <div ref={printRef} className="overflow-auto timetable-print-target">
      <table className="border-separate border-spacing-0 text-xs w-full">
        <thead className="sticky top-0 z-10 bg-muted">
          <tr>
            <th className="sticky left-0 z-20 bg-muted border border-border px-3 py-1.5 text-left min-w-[95px] text-xs font-semibold">
              Staff
            </th>
            {columns.map((col) => {
              const fdTiming = col.timings?.find((t) => t.config === 'full_day')
              const hdTiming = col.timings?.find((t) => t.config === 'half_day')
              return (
                <th
                  key={col.key}
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
          {staff.map((member) => (
            <tr key={member.id}>
              <td className="sticky left-0 z-10 bg-muted border border-border px-3 py-2 whitespace-nowrap text-xs">
                <div className="font-medium text-foreground">{member.full_name}</div>
                {member.name_initials && (
                  <div className="text-muted-foreground text-[10px]">{member.name_initials}</div>
                )}
              </td>

              {columns.map((col) => {
                const entries = member.slots.filter((sl) => sl.periodNumber === col.periodNumber)

                if (entries.length > 1) {
                  return (
                    <td key={col.key} className="border border-border p-1.5 align-top text-xs">
                      <div>
                        {entries.map((entry, i) => {
                          const entrySubjectLine = entry.subject1
                            ? `${entry.subject1.name_initials ?? entry.subject1.name}${entry.subject2 ? ` / ${entry.subject2.name_initials ?? entry.subject2.name}` : ''}`
                            : null
                          return (
                            <div
                              key={i}
                              className={i > 0 ? 'border-t border-border/40 py-0.5' : 'py-0.5'}
                            >
                              <p className="font-medium text-foreground leading-tight">
                                {entry.classGroupName}
                                {entry.sectionName && <span> · {entry.sectionName}</span>}
                              </p>
                              {entrySubjectLine && (
                                <p className="text-muted-foreground/80 leading-tight">{entrySubjectLine}</p>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </td>
                  )
                }

                const slot = entries[0] ?? null
                const subjectLine = slot?.subject1
                  ? `${slot.subject1.name_initials ?? slot.subject1.name}${slot.subject2 ? ` / ${slot.subject2.name_initials ?? slot.subject2.name}` : ''}`
                  : null

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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
