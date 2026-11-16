import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import RichText from '@/modules/homework/components/RichText'

// Post classwork and homework together: set the dates, pick the classes and subjects from the
// timetable, type either or both, one Save. Classes that already have an assignment for the
// assigned date are not offered again.
export default function PostAssignmentForm({
  assignedDate, dueDate, minDueDate, maxAssignedDate, onAssignedDateChange, onDueDateChange,
  availableTargets, hiddenCount, saving, error, dueReason, onSubmit, onCancel,
}) {
  const [selected, setSelected] = useState(() => new Set())
  const [classwork, setClasswork] = useState('')
  const [homework, setHomework] = useState('')

  // Drop a choice that is no longer offered (for example after the assigned date changed).
  useEffect(() => {
    setSelected((prev) => {
      const keep = new Set([...prev].filter((key) => availableTargets.some((t) => t.key === key)))
      return keep.size === prev.size ? prev : keep
    })
  }, [availableTargets])

  
  const classworkLocked = Boolean(assignedDate && dueDate && dueDate !== assignedDate)
  useEffect(() => {
    if (classworkLocked) setClasswork('')
  }, [classworkLocked])

  const allSelected = availableTargets.length > 0 && selected.size === availableTargets.length
  const canSave = !saving && selected.size > 0 && Boolean(classwork.trim() || homework.trim())

  const toggle = (key) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(availableTargets.map((t) => t.key)))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!canSave) return
    onSubmit({
      selected: availableTargets.filter((t) => selected.has(t.key)),
      classwork: classworkLocked ? '' : classwork,
      homework,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="post-assigned">Assigned Date</Label>
          <Input
            id="post-assigned"
            type="date"
            value={assignedDate}
            max={maxAssignedDate}
            onChange={(e) => onAssignedDateChange(e.target.value)}
            disabled={saving}
            className="w-44"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="post-due">Due Date</Label>
          <Input
            id="post-due"
            type="date"
            value={dueDate}
            min={minDueDate}
            onChange={(e) => onDueDateChange(e.target.value)}
            disabled={saving}
            className="w-44"
          />
        </div>
      </div>
      {dueReason && (
        <p className="-mt-2 text-xs text-amber-600 dark:text-amber-400">The due date falls on {dueReason}.</p>
      )}

      <div className="flex items-center justify-between gap-3">
        <Label>Timetable wise: classes and subjects</Label>
        {availableTargets.length > 1 && (
          <Button type="button" size="sm" variant="ghost" onClick={toggleAll} disabled={saving}>
            {allSelected ? 'Clear' : 'Select all'}
          </Button>
        )}
      </div>

      {availableTargets.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-sm text-muted-foreground">
          Every class and subject already has an assignment for this date. Edit it from the list below.
        </p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {availableTargets.map((target) => (
            <label
              key={target.key}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
                selected.has(target.key) ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40',
              )}
            >
              <input
                type="checkbox"
                className="size-4 accent-primary"
                checked={selected.has(target.key)}
                onChange={() => toggle(target.key)}
                disabled={saving}
              />
              <span className="min-w-0">
                <RichText text={target.classLabel} ordinal />{' '}
                <span className="text-muted-foreground">{target.subjectName}</span>
              </span>
            </label>
          ))}
        </div>
      )}

      {hiddenCount > 0 && (
        <p className="text-xs text-muted-foreground">
          {hiddenCount} {hiddenCount === 1 ? 'class and subject already has' : 'classes and subjects already have'} an
          assignment for this date, so {hiddenCount === 1 ? 'it is' : 'they are'} not listed.
        </p>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="post-classwork">Classwork</Label>
          <Textarea
            id="post-classwork"
            dir="auto"
            rows={4}
            value={classwork}
                        onChange={(e) => setClasswork(e.target.value)}
            placeholder={classworkLocked ? 'Not available: the due date is after the assigned date' : 'Enter classwork'}
            disabled={saving || classworkLocked}
          />
          {classworkLocked && (
            <p className="text-xs text-muted-foreground">
              Classwork is for the same day. Set the due date to the assigned date to enter it.
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="post-homework">Homework</Label>
          <Textarea
            id="post-homework"
            dir="auto"
            rows={4}
            value={homework}
            onChange={(e) => setHomework(e.target.value)}
            placeholder="Enter homework"
            disabled={saving}
          />
        </div>
      </div>

      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button type="submit" disabled={!canSave}>{saving ? 'Saving…' : 'Save'}</Button>
      </div>
    </form>
  )
}