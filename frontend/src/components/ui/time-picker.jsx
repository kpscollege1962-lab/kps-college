import { cn } from '@/lib/utils'

const HOURS   = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))

const selectInnerClass =
  'bg-transparent outline-none cursor-pointer appearance-none w-8 text-center disabled:pointer-events-none'

// value: "HH:MM" string or ""
// onChange: called with "HH:MM" string or ""
function TimePicker({ value = '', onChange, disabled = false, className }) {
  const parts  = value ? value.split(':') : ['', '']
  const hour   = parts[0] || ''
  const minute = parts[1] || ''

  const handleHourChange = (e) => {
    const h = e.target.value
    if (!h) { onChange(''); return }
    onChange(`${h}:${minute || '00'}`)
  }

  const handleMinuteChange = (e) => {
    const m = e.target.value
    if (!m) { onChange(''); return }
    onChange(`${hour || '00'}:${m}`)
  }

  return (
    <div
      className={cn(
        'inline-flex h-8 items-center rounded-lg border border-input bg-transparent px-2.5 text-sm transition-colors',
        'focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50',
        disabled && 'pointer-events-none cursor-not-allowed bg-input/50 opacity-50 dark:bg-input/80',
        className
      )}
    >
      <select
        value={hour}
        onChange={handleHourChange}
        disabled={disabled}
        className={selectInnerClass}
      >
        <option value="">HH</option>
        {HOURS.map((h) => (
          <option key={h} value={h}>{h}</option>
        ))}
      </select>

      <span className="mx-0.5 select-none text-muted-foreground">:</span>

      <select
        value={minute}
        onChange={handleMinuteChange}
        disabled={disabled}
        className={selectInnerClass}
      >
        <option value="">MM</option>
        {MINUTES.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
    </div>
  )
}

export { TimePicker }
