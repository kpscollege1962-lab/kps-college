const to12h = (t) => {
  if (!t) return '–'
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`
}

export default function PeriodTimingCell({ period, config }) {
  const timing = period.timings?.find((t) => t.config === config)
  return (
    <th className="border border-border px-1 py-1 bg-muted min-w-[120px]">
      <div className="flex flex-col text-[14px] font-mono text-muted-foreground leading-snug px-1">
        <span>{to12h(timing?.start_time)}</span>
        <span>{to12h(timing?.end_time)}</span>
      </div>
    </th>
  )
}
