export default function PeriodIntervalCell({
  period, intervalDrafts, onIntervalChange, onIntervalBlur, canManage,
}) {
  const fdKey      = `${period.id}-full_day`
  const hdKey      = `${period.id}-half_day`
  const fdHasBreak = !!period.timings?.find((t) => t.config === 'full_day')?.break_duration
  const hdHasBreak = !!period.timings?.find((t) => t.config === 'half_day')?.break_duration

  return (
    <th className="border border-border px-1 py-0.5 bg-muted min-w-[120px]">
      <div className="flex flex-col gap-0.5">
        {/* FD interval */}
        <div className="flex items-center gap-0.5">
          {canManage ? (
            <input
              type="number"
              min={1}
              max={300}
              value={intervalDrafts[fdKey] ?? ''}
              onChange={(e) => onIntervalChange(
                period.id, 'full_day',
                e.target.value === '' ? null : parseInt(e.target.value, 10)
              )}
              onBlur={() => onIntervalBlur('full_day')}
              placeholder="–"
              className="w-full h-5 text-[10px] text-center bg-transparent border-0 outline-none font-mono text-muted-foreground focus:text-foreground"
            />
          ) : (
            <span className="text-[10px] font-mono text-muted-foreground">
              {intervalDrafts[fdKey] ?? '–'}
            </span>
          )}
          {fdHasBreak && <span className="text-[10px] font-mono text-amber-500 shrink-0">{period.timings?.find((t) => t.config === 'full_day')?.break_duration}</span>}
        </div>
        <div className="border-t border-border/30 mx-1" />
        {/* HD interval */}
        <div className="flex items-center gap-0.5">
          {canManage ? (
            <input
              type="number"
              min={1}
              max={300}
              value={intervalDrafts[hdKey] ?? ''}
              onChange={(e) => onIntervalChange(
                period.id, 'half_day',
                e.target.value === '' ? null : parseInt(e.target.value, 10)
              )}
              onBlur={() => onIntervalBlur('half_day')}
              placeholder="–"
              className="w-full h-5 text-[10px] text-center bg-transparent border-0 outline-none font-mono text-muted-foreground focus:text-foreground"
            />
          ) : (
            <span className="text-[10px] font-mono text-muted-foreground">
              {intervalDrafts[hdKey] ?? '–'}
            </span>
          )}
          {hdHasBreak && <span className="text-[10px] font-mono text-amber-500 shrink-0">{period.timings?.find((t) => t.config === 'half_day')?.break_duration}</span>}
        </div>
      </div>
    </th>
  )
}
