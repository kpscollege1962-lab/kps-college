import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Download, Printer, Shuffle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toLocalDateString, parseLocalDate } from '@/lib/dateUtils'
import { getNextWorkingDay, nonWorkingReason } from '@/lib/workingDays'
import { DEFAULT_QUOTE, pickRandomQuote } from '../constants/quotes'
import { downloadNodeAsJpg, safeFileName } from '../utils/exportJpg'
import { useSheetBranding } from '../hooks/useSheetBranding'
import HomeworkSheet from './HomeworkSheet'
import PrintPortal from './PrintPortal'

const MAX_CHIPS = 8

const fmtChip = (d) =>
  parseLocalDate(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })

export default function SheetReportDialog({
  open, onOpenChange, campusId, title, label, view, assignments = [], loading = false, error = null, editableQuote = false,
}) {
  const sheetRef = useRef(null)
  const [date, setDate]       = useState(() => toLocalDateString())
  const [dueDate, setDueDate] = useState(() => getNextWorkingDay())
  const [quote, setQuote]     = useState(DEFAULT_QUOTE)
  const [fit, setFit]         = useState({ scale: 1, overflow: false })
  const [exporting, setExporting]     = useState(false)
  const [exportError, setExportError] = useState(null)

  const branding = useSheetBranding(campusId, open)

  useEffect(() => {
    if (!open) return
    const today = toLocalDateString()
    setDate(today)
    setDueDate(getNextWorkingDay(today))
    setQuote(DEFAULT_QUOTE)
    setExportError(null)
  }, [open])

  const handleDateChange = (value) => {
    setDate(value)
    if (value) setDueDate(getNextWorkingDay(value))
  }

  const handleFit = useCallback((info) => {
    setFit((prev) => (prev.scale === info.scale && prev.overflow === info.overflow ? prev : info))
  }, [])

  const combos = useMemo(() => {
    const seen = new Map()
    for (const a of assignments) {
      if (!a.assigned_date) continue
      const key = `${a.assigned_date}|${a.due_date}`
      if (!seen.has(key)) seen.set(key, { assigned: a.assigned_date, due: a.due_date })
    }
    return [...seen.values()]
      .sort((x, y) => y.assigned.localeCompare(x.assigned) || y.due.localeCompare(x.due))
      .slice(0, MAX_CHIPS)
  }, [assignments])

  const forPeriod = useMemo(
    () => assignments.filter((a) => a.assigned_date === date && a.due_date === dueDate),
    [assignments, date, dueDate]
  )

  const dueReason = nonWorkingReason(dueDate)
  const canPrint = !loading && !error && forPeriod.length > 0

  const sheetProps = {
    label,
    view,
    dueDate,
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
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="report-date">Date</Label>
              <Input id="report-date" type="date" value={date} onChange={(e) => handleDateChange(e.target.value)} className="w-44" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="report-due">Due date</Label>
              <Input id="report-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-44" />
            </div>
            <p className="pb-2 text-sm text-muted-foreground">
              {loading ? 'Loading…' : `${forPeriod.length} assignment${forPeriod.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          {dueReason && (
            <p className="-mt-2 text-xs text-amber-600 dark:text-amber-400">The due date falls on {dueReason}.</p>
          )}

          {!loading && combos.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Available:</span>
              {combos.map((c) => {
                const selected = c.assigned === date && c.due === dueDate
                return (
                  <button
                    key={`${c.assigned}|${c.due}`}
                    type="button"
                    onClick={() => { setDate(c.assigned); setDueDate(c.due) }}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs transition-colors',
                      selected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground',
                    )}
                  >
                    Given {fmtChip(c.assigned)}, due {fmtChip(c.due)}
                  </button>
                )
              })}
            </div>
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
                <p className="text-sm font-medium text-foreground">No assignments given on this date and due on this due date</p>
                <p className="text-xs text-muted-foreground">
                  {assignments.length === 0
                    ? 'Nothing has been posted yet.'
                    : 'Pick one of the available combinations above, or change the dates.'}
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
            <Button type="button" variant="outline" onClick={handleDownload} disabled={!canPrint || exporting}>
              <Download className="size-3.5 mr-1.5" />
              {exporting ? 'Creating…' : 'Download JPG'}
            </Button>
            <Button type="button" onClick={() => window.print()} disabled={!canPrint}>
              <Printer className="size-3.5 mr-1.5" />
              Print / Save as PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {open && canPrint && (
        <PrintPortal>
          <HomeworkSheet {...sheetProps} />
        </PrintPortal>
      )}
    </>
  )
}