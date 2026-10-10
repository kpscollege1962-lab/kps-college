import { useEffect, useMemo, useState } from 'react'
import { Printer, Shuffle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toLocalDateString, parseLocalDate } from '@/lib/dateUtils'
import { listHomeworkService } from '../services/homework.service'
import { DEFAULT_QUOTE, pickRandomQuote } from '../constants/quotes'
import HomeworkSheet from './HomeworkSheet'
import PrintPortal from './PrintPortal'

const formatChip = (d) =>
  parseLocalDate(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })

export default function HomeworkReportDialog({
  open, onOpenChange, campusId, sessionId, classes, fallbackTeacherName, defaultDate,
}) {
  const [dueDate, setDueDate]         = useState('')
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [quote, setQuote]             = useState(DEFAULT_QUOTE)

  // Start from the default quote each time the report is opened.
  useEffect(() => {
    if (open) setQuote(DEFAULT_QUOTE)
  }, [open])

  // Fetch ALL of this teacher's assignments once per open, then filter by date locally.
  useEffect(() => {
    if (!open) { setLoading(true); return }
    if (!campusId || !sessionId) { setLoading(false); return }

    let cancelled = false
    setLoading(true)
    setError(null)
    listHomeworkService(campusId, { sessionId, mine: true, limit: 100 }).then((result) => {
      if (cancelled) return
      setLoading(false)
      if (!result.success) { setError(result.message); return }

      const all = result.data.data
      setAssignments(all)

      // Open on the nearest upcoming due date that actually has assignments.
      const today = toLocalDateString()
      const nextDue = all.map((a) => a.due_date).filter((d) => d >= today).sort()[0]
      setDueDate(nextDue ?? defaultDate)
    })
    return () => { cancelled = true }
  }, [open, campusId, sessionId]) // eslint-disable-line react-hooks/exhaustive-deps

  const today = toLocalDateString()
  const upcomingDates = useMemo(
    () => [...new Set(assignments.map((a) => a.due_date))].filter((d) => d >= today).sort().slice(0, 8),
    [assignments, today]
  )
  const forDate = useMemo(() => assignments.filter((a) => a.due_date === dueDate), [assignments, dueDate])

  const teacherName = assignments[0]?.postedBy?.full_name ?? fallbackTeacherName
  const canPrint = !loading && !error && forDate.length > 0

  const sheet = (
    <HomeworkSheet
      teacherName={teacherName}
      dueDate={dueDate}
      classes={classes}
      assignments={forDate}
      quote={quote}
    />
  )

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate Report</DialogTitle>
          </DialogHeader>

          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="report-date">Due date</Label>
              <Input id="report-date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-44" />
            </div>
            <p className="pb-2 text-sm text-muted-foreground">
              {loading ? 'Loading…' : `${forDate.length} assignment${forDate.length !== 1 ? 's' : ''} due on this date`}
            </p>
          </div>

          {!loading && upcomingDates.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Upcoming:</span>
              {upcomingDates.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDueDate(d)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs transition-colors',
                    d === dueDate
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground',
                  )}
                >
                  {formatChip(d)}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="report-quote">Quote</Label>
              <Button type="button" size="sm" variant="ghost" onClick={() => setQuote((q) => pickRandomQuote(q))}>
                <Shuffle className="size-3.5 mr-1.5" />
                Generate
              </Button>
            </div>
            <Textarea
              id="report-quote"
              dir="auto"
              rows={2}
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="Type your own quote, or leave empty to print without one"
            />
          </div>

          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

          <div className="max-h-[50vh] overflow-auto rounded-xl border border-border bg-muted/40 p-3">
            {loading ? (
              <Skeleton className="mx-auto h-96 w-full max-w-[210mm] rounded-lg" />
            ) : forDate.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-1 py-16 text-center">
                <p className="text-sm font-medium text-foreground">No assignments due on this date</p>
                <p className="text-xs text-muted-foreground">
                  {assignments.length === 0
                    ? 'Post an assignment first, then come back to generate the report.'
                    : 'Choose a date that has assignments.'}
                </p>
              </div>
            ) : (
              <div className="mx-auto w-fit">{sheet}</div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
            <Button type="button" onClick={() => window.print()} disabled={!canPrint}>
              <Printer className="size-3.5 mr-1.5" />
              Print / Save as PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {open && canPrint && <PrintPortal>{sheet}</PrintPortal>}
    </>
  )
}