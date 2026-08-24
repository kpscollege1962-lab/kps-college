import { useState, useEffect, useRef } from 'react'
import { parseISO, format, isValid, getDaysInMonth, getDate, getMonth, getYear } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'

const CURRENT_YEAR = new Date().getFullYear()
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined'
      ? window.matchMedia('(pointer: coarse)').matches
      : false
  )
  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)')
    const handler = (e) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isMobile
}

// Parses a format string into segment order, month display type, and separator.
// Supported: DD/MM/YYYY  DD/MMM/YYYY  DD-MM-YYYY  DD-MMM-YYYY  YYYY-MM-DD  MM/DD/YYYY
function parseFormat(fmt) {
  const monthType = fmt.includes('MMM') ? 'alpha' : 'numeric'
  const separator = fmt.includes('/') ? '/' : '-'
  const ddIdx = fmt.indexOf('DD')
  const yyyyIdx = fmt.indexOf('YYYY')
  const mmIdx = monthType === 'alpha' ? fmt.indexOf('MMM') : fmt.indexOf('MM')
  const positions = { [ddIdx]: 'day', [yyyyIdx]: 'year', [mmIdx]: 'month' }
  const segmentOrder = Object.keys(positions)
    .sort((a, b) => Number(a) - Number(b))
    .map((k) => positions[k])
  return { segmentOrder, monthType, separator }
}

function getDayMax(monthStr, yearStr) {
  const m = parseInt(monthStr)
  const y = parseInt(yearStr)
  if (!m) return 31
  if (!y) return getDaysInMonth(new Date(2000, m - 1, 1))
  return getDaysInMonth(new Date(y, m - 1, 1))
}

function allSegmentsFilled(d, m, y) {
  if (!d || !m || !y || d.length !== 2 || m.length !== 2 || y.length !== 4) return false
  const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d))
  return isValid(dateObj) && dateObj.getDate() === parseInt(d)
}

function DatePicker({
  value = '',
  onChange,
  format: fmt = 'DD/MMM/YYYY',
  disabled = false,
  placeholder = 'Pick a date',
  className,
  captionLayout = 'dropdown',
  fromYear = 1940,
  toYear = CURRENT_YEAR + 10,
}) {
  const { segmentOrder, monthType, separator } = parseFormat(fmt)
  const isMobile = useIsMobile()

  const [day, setDay] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const [focused, setFocused] = useState(null)
  const [open, setOpen] = useState(false)
  const [pendingDigits, setPending] = useState('')
  // active: whether to show segments vs placeholder
  const [active, setActive] = useState(false)

  const dayRef = useRef(null)
  const monthRef = useRef(null)
  const yearRef = useRef(null)
  const containerRef = useRef(null)

  const segmentRefs = { day: dayRef, month: monthRef, year: yearRef }

  // Sync controlled value → segment state
  useEffect(() => {
    if (value) {
      const parsed = parseISO(value)
      if (isValid(parsed)) {
        setDay(String(getDate(parsed)).padStart(2, '0'))
        setMonth(String(getMonth(parsed) + 1).padStart(2, '0'))
        setYear(String(getYear(parsed)))
        setActive(true)
      }
    } else {
      setDay('')
      setMonth('')
      setYear('')
      // Intentionally not resetting active — keep segments visible mid-entry
    }
  }, [value])

  function focusSegment(seg) {
    segmentRefs[seg]?.current?.focus()
  }

  function getNextSeg(seg) {
    const idx = segmentOrder.indexOf(seg)
    return idx < segmentOrder.length - 1 ? segmentOrder[idx + 1] : null
  }

  function getPrevSeg(seg) {
    const idx = segmentOrder.indexOf(seg)
    return idx > 0 ? segmentOrder[idx - 1] : null
  }

  function tryFireChange(d, m, y) {
    if (allSegmentsFilled(d, m, y)) {
      const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d))
      onChange(format(dateObj, 'yyyy-MM-dd'))
    }
  }

  function handleKeyDown(e) {
    if (disabled || !focused) return
    const { key } = e

    if (key === 'Escape') {
      e.preventDefault()
      if (open) {
        setOpen(false)
      } else {
        setFocused(null)
        segmentRefs[focused]?.current?.blur()
      }
      return
    }

    if (key === 'Tab') {
      if (e.shiftKey) {
        const prev = getPrevSeg(focused)
        if (prev) { e.preventDefault(); setPending(''); focusSegment(prev) }
      } else {
        const next = getNextSeg(focused)
        if (next) { e.preventDefault(); setPending(''); focusSegment(next) }
      }
      return
    }

    if (key === 'ArrowLeft') {
      e.preventDefault()
      setPending('')
      const prev = getPrevSeg(focused)
      if (prev) focusSegment(prev)
      return
    }

    if (key === 'ArrowRight') {
      e.preventDefault()
      setPending('')
      const next = getNextSeg(focused)
      if (next) focusSegment(next)
      return
    }

    if (key === 'Backspace' || key === 'Delete') {
      e.preventDefault()
      setPending('')
      const wasValid = value && isValid(parseISO(value))
      if (focused === 'day') setDay('')
      else if (focused === 'month') setMonth('')
      else setYear('')
      if (wasValid) onChange('')
      return
    }

    if (key === 'ArrowUp' || key === 'ArrowDown') {
      e.preventDefault()
      const dir = key === 'ArrowUp' ? 1 : -1

      if (focused === 'day') {
        const max = getDayMax(month, year)
        let d = day ? parseInt(day) : dir === 1 ? 0 : max + 1
        d += dir
        if (d > max) d = 1
        if (d < 1) d = max
        const nd = String(d).padStart(2, '0')
        setDay(nd)
        tryFireChange(nd, month, year)
      } else if (focused === 'month') {
        let m = month ? parseInt(month) : dir === 1 ? 0 : 13
        m += dir
        if (m > 12) m = 1
        if (m < 1) m = 12
        const nm = String(m).padStart(2, '0')
        let nd = day
        if (day) {
          const max = getDayMax(nm, year)
          if (parseInt(day) > max) {
            nd = String(max).padStart(2, '0')
            setDay(nd)
            if (value && isValid(parseISO(value))) onChange('')
          }
        }
        setMonth(nm)
        tryFireChange(nd, nm, year)
      } else {
        let y = year ? parseInt(year) : CURRENT_YEAR
        y += dir
        if (y > toYear) y = toYear
        if (y < fromYear) y = fromYear
        const ny = String(y)
        setYear(ny)
        tryFireChange(day, month, ny)
      }
      return
    }

    if (key >= '0' && key <= '9') {
      e.preventDefault()
      const digit = key

      if (focused === 'day') {
        if (!pendingDigits) {
          if (digit === '0') {
            setPending('0')
          } else if (digit === '1' || digit === '2' || digit === '3') {
            setPending(digit)
          } else {
            // 4–9: unambiguous single-digit day
            const nd = digit.padStart(2, '0')
            setDay(nd)
            setPending('')
            const next = getNextSeg('day')
            if (next) focusSegment(next)
            tryFireChange(nd, month, year)
          }
        } else {
          const num = parseInt(pendingDigits + digit)
          const max = getDayMax(month, year)
          const nd = String(Math.min(Math.max(num, 1), max)).padStart(2, '0')
          setDay(nd)
          setPending('')
          const next = getNextSeg('day')
          if (next) focusSegment(next)
          tryFireChange(nd, month, year)
        }
      } else if (focused === 'month') {
        if (!pendingDigits) {
          if (digit === '0' || digit === '1') {
            setPending(digit)
          } else {
            // 2–9: unambiguous single-digit month
            const nm = digit.padStart(2, '0')
            let nd = day
            if (day) {
              const max = getDayMax(nm, year)
              if (parseInt(day) > max) { nd = String(max).padStart(2, '0'); setDay(nd) }
            }
            setMonth(nm)
            setPending('')
            const next = getNextSeg('month')
            if (next) focusSegment(next)
            tryFireChange(nd, nm, year)
          }
        } else {
          const num = parseInt(pendingDigits + digit)
          const nm = String(Math.min(Math.max(num, 1), 12)).padStart(2, '0')
          let nd = day
          if (day) {
            const max = getDayMax(nm, year)
            if (parseInt(day) > max) { nd = String(max).padStart(2, '0'); setDay(nd) }
          }
          setMonth(nm)
          setPending('')
          const next = getNextSeg('month')
          if (next) focusSegment(next)
          tryFireChange(nd, nm, year)
        }
      } else {
        // year: accumulate 4 digits before committing
        const np = pendingDigits + digit
        if (np.length < 4) {
          setPending(np)
        } else {
          let y = parseInt(np)
          if (y < fromYear) y = fromYear
          if (y > toYear) y = toYear
          const ny = String(y)
          setYear(ny)
          setPending('')
          const next = getNextSeg('year')
          if (next) focusSegment(next)
          tryFireChange(day, month, ny)
        }
      }
      return
    }
  }

  function handleSegmentFocus(seg) {
    setFocused(seg)
    setActive(true)
    setPending('')
  }

  function handleSegmentBlur(seg, e) {
    setPending('')
    const rt = e.relatedTarget
    const isOtherSegment = rt === dayRef.current || rt === monthRef.current || rt === yearRef.current
    if (!isOtherSegment && focused === seg) setFocused(null)
  }

  const isValidDate = allSegmentsFilled(day, month, year)
  const selectedDate = isValidDate
    ? new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    : undefined

  function renderSegment(seg) {
    const isFocused = focused === seg
    let displayValue = ''
    let isEmpty = true

    if (seg === 'day') {
      if (day) { displayValue = day; isEmpty = false }
      else if (isFocused && pendingDigits) { displayValue = pendingDigits; isEmpty = false }
      else displayValue = 'DD'
    } else if (seg === 'month') {
      if (month) {
        isEmpty = false
        displayValue = monthType === 'alpha' ? MONTH_NAMES[parseInt(month) - 1] : month
      } else if (isFocused && pendingDigits) {
        displayValue = pendingDigits
        isEmpty = false
      } else {
        displayValue = monthType === 'alpha' ? 'MMM' : 'MM'
      }
    } else {
      if (year) { displayValue = year; isEmpty = false }
      else if (isFocused && pendingDigits) { displayValue = pendingDigits; isEmpty = false }
      else displayValue = 'YYYY'
    }

    const ariaMin = seg === 'year' ? fromYear : 1
    const ariaMax = seg === 'day' ? getDayMax(month, year) : seg === 'month' ? 12 : toYear
    const ariaLabel = seg === 'day' ? 'Day' : seg === 'month' ? 'Month' : 'Year'
    const ariaValueNow =
      seg === 'day' && day ? parseInt(day) :
      seg === 'month' && month ? parseInt(month) :
      seg === 'year' && year ? parseInt(year) :
      undefined

    return (
      <span
        ref={segmentRefs[seg]}
        role="spinbutton"
        aria-label={ariaLabel}
        aria-valuemin={ariaMin}
        aria-valuemax={ariaMax}
        aria-valuenow={ariaValueNow}
        tabIndex={isMobile ? -1 : 0}
        onFocus={isMobile ? undefined : () => handleSegmentFocus(seg)}
        onBlur={isMobile ? undefined : (e) => handleSegmentBlur(seg, e)}
        className={cn(
          'rounded px-0.5 outline-none select-none tabular-nums',
          !isMobile && 'cursor-default',
          isEmpty && 'text-muted-foreground/40',
          isFocused && !isMobile && 'bg-primary/20 text-primary',
        )}
      >
        {displayValue}
      </span>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div
        ref={containerRef}
        onKeyDown={isMobile ? undefined : handleKeyDown}
        className={cn(
          'h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm',
          'flex items-center',
          'focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50',
          disabled && 'pointer-events-none opacity-50',
          className,
        )}
      >
        {/* Segment area — flex-1 so icon stays flush right */}
        <div
          className={cn(
            'relative flex-1 flex items-center min-w-0 overflow-hidden',
            isMobile && !disabled && 'cursor-pointer',
          )}
          onClick={isMobile && !disabled ? () => setOpen(true) : undefined}
        >
          {/* Segments — always in DOM so Tab navigation reaches them; hidden behind placeholder until active */}
          <div
            className={cn(
              'flex items-center',
              !active && 'opacity-0 pointer-events-none',
            )}
          >
            {segmentOrder.map((seg, idx) => (
              <span key={seg} className="flex items-center">
                {renderSegment(seg)}
                {idx < segmentOrder.length - 1 && (
                  <span
                    className="text-muted-foreground/50 select-none mx-px"
                    aria-hidden="true"
                  >
                    {separator}
                  </span>
                )}
              </span>
            ))}
          </div>

          {/* Placeholder — overlaid when not yet active */}
          {!active && (
            <span
              className="absolute inset-0 flex items-center text-muted-foreground cursor-text"
              onClick={(e) => {
                if (isMobile) {
                  e.stopPropagation()
                  setOpen(true)
                } else {
                  setActive(true)
                  focusSegment(segmentOrder[0])
                }
              }}
            >
              {placeholder}
            </span>
          )}
        </div>

        <PopoverTrigger
          type="button"
          disabled={disabled}
          className={cn(
            'ml-1.5 flex items-center justify-center shrink-0',
            'text-muted-foreground hover:text-foreground transition-colors',
            'focus-visible:outline-none',
          )}
        >
          <CalendarIcon className="size-3.5 opacity-60" />
        </PopoverTrigger>
      </div>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={isValidDate ? selectedDate : undefined}
          defaultMonth={isValidDate ? selectedDate : undefined}
          onSelect={(date) => {
            if (date) {
              setDay(String(getDate(date)).padStart(2, '0'))
              setMonth(String(getMonth(date) + 1).padStart(2, '0'))
              setYear(String(getYear(date)))
              setActive(true)
              onChange(format(date, 'yyyy-MM-dd'))
              setOpen(false)
            }
          }}
          captionLayout={captionLayout}
          fromYear={fromYear}
          toYear={toYear}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker }
