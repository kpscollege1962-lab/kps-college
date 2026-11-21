import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Download, Printer, Shuffle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toLocalDateString } from '@/lib/dateUtils'
import { DEFAULT_QUOTE, pickRandomQuote } from '../constants/quotes'
import { downloadNodeAsJpg, safeFileName } from '../utils/exportJpg'
import { useSheetBranding } from '../hooks/useSheetBranding'
import HomeworkSheet from './HomeworkSheet'
import PrintPortal from './PrintPortal'

// The day the report opens on: today if today has work, otherwise the newest assigned date.
const openingDay = (assignments) => {
  const today = toLocalDateString()
  if (assignments.some((a) => a.assigned_date === today)) return today
  return assignments.reduce((max, a) => (a.assigned_date && a.assigned_date > (max ?? '') ? a.assigned_date : max), null) ?? today
}

// The report body: dates, quote, preview, warnings, Download / Print and the hidden print copy.
// Moved out of SheetReportDialog so it can also sit inline on a page.
// Date and Due date work like the page's View: the sheet shows the work ASSIGNED from Date to
// Due date (inclusive). Both open on the same day (see openingDay).
//   active:   true while it is on screen (was the dialog's `open`).
//   onClose:  the Close button.
//   Footer:   the element that wraps the buttons (DialogFooter in the dialog).
const PlainFooter = ({ children }) => <div className="flex flex-wrap justify-end gap-2">{children}</div>

export default function SheetReportPanel({
  active = true, onClose, Footer = PlainFooter, campusId, label, view, assignments = [], loading = false, error = null, editableQuote = false,
}) {
  const FooterTag = Footer
  const sheetRef = useRef(null)
  const [date, setDate]       = useState(() => toLocalDateString())
  const [dueDate, setDueDate] = useState(() => toLocalDateString())
  const [datesSet, setDatesSet] = useState(false) // opening day chosen for this showing
  const [quote, setQuote]     = useState(DEFAULT_QUOTE)
  const [fit, setFit]         = useState({ scale: 1, overflow: false })
  const [exporting, setExporting]     = useState(false)
  const [exportError, setExportError] = useState(null)

  const branding = useSheetBranding(campusId, active)

  useEffect(() => {
    if (!active) { setDatesSet(false); return }
    setQuote(DEFAULT_QUOTE)
    setExportError(null)
  }, [active])

  // Once the assignments are in, open both dates on the same day that has work.
  useEffect(() => {
    if (!active || loading || datesSet) return
    const day = openingDay(assignments)
    setDate(day)
    setDueDate(day)
    setDatesSet(true)
  }, [active, loading, datesSet, assignments])

  const handleFit = useCallback((info) => {
    setFit((prev) => (prev.scale === info.scale && prev.overflow === info.overflow ? prev : info))
  }, [])

  // Work ASSIGNED from Date to Due date, inclusive (an empty end is open).
  const forPeriod = useMemo(
    () => assignments.filter((a) =>
      a.assigned_date && (!date || a.assigned_date >= date) && (!dueDate || a.assigned_date <= dueDate)),
    [assignments, date, dueDate]
  )
  const reversed = Boolean(date && dueDate && dueDate < date)

  // Previous / next day that has work: before the Date, or after the Due date. Both dates jump to it.
  const workDays = useMemo(
    () => [...new Set(assignments.map((a) => a.assigned_date).filter(Boolean))].sort(),
    [assignments]
  )
  const prevDay = date ? [...workDays].reverse().find((d) => d < date) ?? null : null
  const nextDay = (dueDate || date) ? workDays.find((d) => d > (dueDate || date)) ?? null : null
  const goToDay = (day) => { setDate(day); setDueDate(day) }

  const canPrint = !loading && !error && forPeriod.length > 0

  const sheetProps = {
    label,
    view,
    dueDate,
    date,
    assignments: forPeriod,
    titleUrl: branding.titleUrl,
    watermarkUrl: branding.watermarkUrl,
    ...(editableQuote && { quote }),
  }

  const handleDownload = async () => {
    if (!sheetRef.current) return
    setExporting(true)
    setExportError(null)
    try {
      await downloadNodeAsJpg(sheetRef.current, `${safeFileName(`${label} assignments ${dueDate}`)}.jpg`)
    } catch (err) {
      console.error(err)
      setExportError('Could not create the image. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <>
          {/* ‹ Assigned Date  Due Date › stay on one row; on a phone the dates shrink to fit. */}
          <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
            <div className="grid w-full grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)_auto] items-end gap-2 sm:w-auto sm:grid-cols-[auto_11rem_11rem_auto] sm:gap-3">
              <Button
                type="button" variant="outline" size="icon" className="size-8"
                onClick={() => goToDay(prevDay)} disabled={loading || !prevDay}
                aria-label="Previous day with work" title="Previous day with work"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <div className="grid min-w-0 gap-1.5">
                <Label htmlFor="report-date">Assigned Date</Label>
                <Input id="report-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full min-w-0" />
              </div>
              <div className="grid min-w-0 gap-1.5">
                <Label htmlFor="report-due">Due Date</Label>
                <Input id="report-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full min-w-0" />
              </div>
              <Button
                type="button" variant="outline" size="icon" className="size-8"
                onClick={() => goToDay(nextDay)} disabled={loading || !nextDay}
                aria-label="Next day with work" title="Next day with work"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground sm:pb-1.5">
              {loading ? 'Loading…' : `${forPeriod.length} assignment${forPeriod.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          {reversed && (
            <p className="-mt-2 text-xs text-amber-600 dark:text-amber-400">The Due Date is before the Assigned Date, so nothing matches.</p>
          )}

          {editableQuote && (
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
          )}

          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
          {exportError && <Alert variant="destructive"><AlertDescription>{exportError}</AlertDescription></Alert>}

          <div className="max-h-[50vh] overflow-auto rounded-xl border border-border bg-muted/40 p-3">
            {loading ? (
              <Skeleton className="mx-auto h-96 w-full max-w-[210mm] rounded-lg" />
            ) : forPeriod.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-1 py-16 text-center">
                <p className="text-sm font-medium text-foreground">No assignments given in these dates</p>
                <p className="text-xs text-muted-foreground">
                  {assignments.length === 0 ? 'Nothing has been posted yet.' : 'Change the dates, or use ‹ › to jump to a day with work.'}
                </p>
              </div>
            ) : (
              <div className="mx-auto w-fit">
                <HomeworkSheet ref={sheetRef} {...sheetProps} onFit={handleFit} />
              </div>
            )}
          </div>

          {canPrint && fit.overflow && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              There is too much for one page, so the bottom of the sheet is cut off. Use fewer dates or classes.
            </p>
          )}
          {canPrint && !fit.overflow && fit.scale < 0.85 && (
            <p className="text-xs text-muted-foreground">Scaled to {Math.round(fit.scale * 100)}% to fit one page.</p>
          )}

          <FooterTag>
            <Button type="button" variant="outline" onClick={onClose}>Close</Button>
            <Button type="button" variant="outline" onClick={handleDownload} disabled={!canPrint || exporting}>
              <Download className="size-3.5 mr-1.5" />
              {exporting ? 'Creating…' : 'Download JPG'}
            </Button>
            <Button type="button" onClick={() => window.print()} disabled={!canPrint}>
              <Printer className="size-3.5 mr-1.5" />
              Print / Save as PDF
            </Button>
          </FooterTag>

      {active && canPrint && (
        <PrintPortal>
          <HomeworkSheet {...sheetProps} />
        </PrintPortal>
      )}
    </>
  )
}