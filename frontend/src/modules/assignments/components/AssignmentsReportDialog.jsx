import { useEffect, useMemo, useState } from 'react'
import { Printer } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toLocalDateString, parseLocalDate } from '@/lib/dateUtils'
import HomeworkSheet from '@/modules/homework/components/HomeworkSheet'
import PrintPortal from '@/modules/homework/components/PrintPortal'

const formatChip = (d) =>
  parseLocalDate(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })

// group: { label, assignments, classes } from buildGroups()
export default function AssignmentsReportDialog({ open, onOpenChange, group }) {
  const [dueDate, setDueDate] = useState('')

  const dates = useMemo(
    () => [...new Set((group?.assignments ?? []).map((a) => a.due_date))].sort(),
    [group]
  )

  // Open on the nearest upcoming due date, or the latest one if all are in the past.
  useEffect(() => {
    if (!open || !group) return
    const today = toLocalDateString()
    setDueDate(dates.find((d) => d >= today) ?? dates[dates.length - 1] ?? today)
  }, [open, group]) // eslint-disable-line react-hooks/exhaustive-deps

  const forDate = useMemo(
    () => (group?.assignments ?? []).filter((a) => a.due_date === dueDate),
    [group, dueDate]
  )
  const canPrint = forDate.length > 0

  // HomeworkSheet's `teacherName` is just its top-left label: here it is the
  // teacher, subject or class the report is for.
  const sheet = group && (
    <HomeworkSheet teacherName={group.label} dueDate={dueDate} classes={group.classes} assignments={forDate} />
  )

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report — {group?.label}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="admin-report-date">Due date</Label>
              <Input id="admin-report-date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-44" />
            </div>
            <p className="pb-2 text-sm text-muted-foreground">
              {forDate.length} assignment{forDate.length !== 1 ? 's' : ''} due on this date
            </p>
          </div>

          {dates.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Dates:</span>
              {dates.map((d) => (
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

          <div className="max-h-[50vh] overflow-auto rounded-xl border border-border bg-muted/40 p-3">
            {forDate.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-1 py-16 text-center">
                <p className="text-sm font-medium text-foreground">No assignments due on this date</p>
                <p className="text-xs text-muted-foreground">Choose one of the dates above.</p>
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