import { useNavigate } from 'react-router'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import RichText from '@/modules/homework/components/RichText'
import { formatTimings } from '../utils/formatTiming'

export default function TeacherTimetable({ cards, loading, error }) {
  const navigate = useNavigate()

  return (
    <section className="space-y-3 rounded-2xl border border-border bg-card p-4">
      <div>
        <h2 className="text-lg font-semibold">Timetable</h2>
        <p className="text-xs text-muted-foreground">Click a class to see its students.</p>
      </div>

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
              className="rounded-xl border border-border bg-background px-4 py-3 text-left transition-colors hover:border-primary/50 hover:bg-accent/40"
            >
              <p className="text-xs font-semibold text-muted-foreground">{card.periodName}</p>
              <p className="mt-0.5 text-sm font-semibold">
                <RichText text={card.classLabel} ordinal />
                {card.subjectText && (
                  <span className="ml-2 font-normal text-muted-foreground"><RichText text={card.subjectText} /></span>
                )}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Timing: {formatTimings(card.timings) ?? '—'}</p>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}