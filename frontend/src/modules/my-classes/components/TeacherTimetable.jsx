import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import RichText from '@/modules/homework/components/RichText'
import { formatTimings } from '../utils/formatTiming'

// Remembered per browser: the timetable starts closed unless the teacher left it open.
const OPEN_KEY = 'myClasses.timetableOpen'
const readOpen = () => {
  try { return localStorage.getItem(OPEN_KEY) === '1' } catch { return false }
}
const saveOpen = (open) => {
  try { localStorage.setItem(OPEN_KEY, open ? '1' : '0') } catch { /* storage blocked: just don't remember */ }
}

export default function TeacherTimetable({ cards, loading, error }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(readOpen)

  const toggle = () => setOpen((o) => { saveOpen(!o); return !o })

  // Closed: one line, e.g. "5 periods · first at 7:45 AM".
  const firstAt = cards.length ? formatTimings(cards[0].timings)?.split(' to ')[0] : null
  const own = cards.filter((c) => !c.rotaFor)
  const rotaToday = cards.length - own.length
  const summary = loading
    ? 'Loading…'
    : `${own.length} period${own.length === 1 ? '' : 's'}${firstAt ? ` · first at ${firstAt}` : ''}${rotaToday ? ` · ${rotaToday} rota today` : ''}`

  return (
    <section className={cn('rounded-2xl border border-border bg-card p-4', open && 'space-y-3')}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls="teacher-timetable"
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div>
          <h2 className="text-lg font-semibold">Timetable</h2>
          <p className="text-xs text-muted-foreground">
            {open ? 'Click a class to see its students.' : summary}
          </p>
        </div>
        <span className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground">
          {open ? 'Hide' : 'Show'}
          <ChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} />
        </span>
      </button>

      <div id="teacher-timetable" hidden={!open} className="space-y-3">

      {loading && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      )}

      {!loading && error && (
        <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
      )}

      {!loading && !error && cards.length === 0 && (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No periods are assigned to you in the timetable yet.
        </p>
      )}

      {!loading && !error && cards.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <button
              key={card.key}
              type="button"
              onClick={() => navigate(`/portal/my-classes/${card.classGroupId}/${card.sectionId}`)}
              className={cn(
                'rounded-xl border bg-background px-4 py-3 text-left transition-colors hover:border-primary/50 hover:bg-accent/40',
                card.rotaFor ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/30' : 'border-border',
                card.coveredBy && 'opacity-60',
              )}
            >
              {card.rotaFor && (
                <p className="mb-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                  Rota today · for {card.rotaFor.staffName ?? 'an absent teacher'}
                </p>
              )}
              {card.coveredBy && (
                <p className="mb-1 text-[11px] font-semibold text-muted-foreground">
                  {card.coveredBy.staffName ? `Covered today by ${card.coveredBy.staffName}` : 'You are on leave for this period today'}
                </p>
              )}
              <p className="text-sm font-semibold">
                <RichText text={card.classLabel} ordinal />
                {card.subjectText && (
                  <span className="ml-2 font-normal text-muted-foreground"><RichText text={card.subjectText} /></span>
                )}
                <span className="ml-1.5 font-normal text-muted-foreground">({card.periodName})</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Timing: {formatTimings(card.timings) ?? '—'}</p>
            </button>
          ))}
        </div>
      )}
      </div>
    </section>
  )
}