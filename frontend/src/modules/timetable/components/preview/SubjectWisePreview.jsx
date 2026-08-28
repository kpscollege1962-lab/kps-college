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
            <tr>
              <th className="sticky left-0 z-20 bg-muted border border-border px-3 py-1.5 text-left min-w-[95px] text-xs font-semibold">
                Subject
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
            {subjects.map((subject) => (
              <tr key={subject.id}>
                <td className="sticky left-0 z-10 bg-muted border border-border px-3 py-2 whitespace-nowrap text-xs">
                  <div className="font-medium text-foreground">{subject.name}</div>
                  {subject.name_initials && (
                    <div className="text-muted-foreground text-[10px]">{subject.name_initials}</div>
                  )}
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
                                {entry.classGroupName}
                                {entry.sectionName && <span> · {entry.sectionName}</span>}
                              </p>
                              <p className="text-muted-foreground/80 leading-tight">
                                {entry.staff?.name_initials ?? entry.staff?.full_name ?? '—'}
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