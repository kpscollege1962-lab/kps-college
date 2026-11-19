import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import RichText from '@/modules/homework/components/RichText'

// What opens after "Post Assignment": just the classwork and homework text.
// The dates and the class + subject come from the filter above, so they are not asked again.
export default function PostAssignmentForm({
  classLabel, subjectName, assignedDate, dueDate, saving, error, onSubmit, onCancel,
}) {
  const [classwork, setClasswork] = useState('')
  const [homework, setHomework] = useState('')

  // Classwork is the work done in class on the assigned day, so it can only be due that same day.
  // Once the due date above is later it is homework only: the classwork box locks and empties.
  const classworkLocked = Boolean(assignedDate && dueDate && dueDate !== assignedDate)
  useEffect(() => {
    if (classworkLocked) setClasswork('')
  }, [classworkLocked])

  const canSave = !saving && Boolean(classwork.trim() || homework.trim())

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!canSave) return
    onSubmit({ classwork: classworkLocked ? '' : classwork, homework })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">
        Posting to{' '}
        <span className="font-medium text-foreground">
          <RichText text={classLabel} ordinal /> {subjectName}
        </span>
      </p>

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
              Classwork is for the same day. Make the Due Date above the same as the Assigned Date to enter it.
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