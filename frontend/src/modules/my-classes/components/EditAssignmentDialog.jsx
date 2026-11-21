import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import RichText from '@/modules/homework/components/RichText'
import { joinRecordTexts } from '../utils/assignmentBoxes'

// Edit one box (classwork + homework for a class, subject and dates).
//   Teacher (default): text only; a missing classwork/homework can be added.
//   admin: also the Assigned Date and Due Date; a classwork or homework that does not exist
//          stays locked, because admins cannot post work for a teacher.
// Same rule everywhere: classwork only when the due date is the assigned date (server: 422).
export default function EditAssignmentDialog({ open, onOpenChange, box, saving, onSave, admin = false }) {
  const [classwork, setClasswork] = useState('')
  const [homework, setHomework] = useState('')
  const [assignedDate, setAssignedDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!open || !box) return
    setClasswork(joinRecordTexts(box.records.classwork))
    setHomework(joinRecordTexts(box.records.homework))
    setAssignedDate(box.assignedDate)
    setDueDate(box.dueDate)
    setError(null)
  }, [open, box])

  const hasClasswork = Boolean(box?.records.classwork.length)
  const hasHomework = Boolean(box?.records.homework.length)

  const classworkLocked = Boolean(box) && (admin
    ? !hasClasswork
    : box.dueDate !== box.assignedDate && !hasClasswork)
  const homeworkLocked = admin && !hasHomework

  // Admin date checks, shown before saving (the server checks the same).
  let dateProblem = null
  if (admin) {
    if (!assignedDate || !dueDate) dateProblem = 'Choose both dates.'
    else if (dueDate < assignedDate) dateProblem = 'The due date cannot be before the assigned date.'
    else if (classwork.trim() && dueDate !== assignedDate) {
      dateProblem = 'Classwork is for the same day: make the due date the assigned date, or empty the classwork.'
    }
  }

  const canSave = !saving && !dateProblem && Boolean(classwork.trim() || homework.trim())

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSave) return
    setError(null)
    const result = await onSave({ classwork, homework, assignedDate, dueDate })
    if (!result.success) setError(result.message)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Edit assignment
            {box && (
              <span className="mt-0.5 block text-sm font-normal text-muted-foreground">
                {box.subjectName} (<RichText text={box.classLabel} ordinal />)
                {admin && box.teacherName && <> · {box.teacherName}</>}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

          {admin && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="edit-assigned">Assigned Date</Label>
                <Input id="edit-assigned" type="date" value={assignedDate} onChange={(e) => setAssignedDate(e.target.value)} disabled={saving} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-due">Due Date</Label>
                <Input id="edit-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} disabled={saving} />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="edit-classwork">Classwork</Label>
            <Textarea id="edit-classwork" dir="auto" rows={3} value={classwork} onChange={(e) => setClasswork(e.target.value)} disabled={saving || classworkLocked} />
            {classworkLocked && (
              <p className="text-xs text-muted-foreground">
                {admin
                  ? 'There is no classwork here, and admins cannot add work for a teacher.'
                  : 'Classwork is for the same day, so it is not available when the due date is later.'}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-homework">Homework</Label>
            <Textarea id="edit-homework" dir="auto" rows={3} value={homework} onChange={(e) => setHomework(e.target.value)} disabled={saving || homeworkLocked} />
            {homeworkLocked && (
              <p className="text-xs text-muted-foreground">There is no homework here, and admins cannot add work for a teacher.</p>
            )}
          </div>
          {dateProblem && <p className="text-xs text-amber-600 dark:text-amber-400">{dateProblem}</p>}
          <p className="text-xs text-muted-foreground">
            Leave a field empty to remove it{admin ? ' (it goes to Recently deleted and can be restored).' : '.'}
          </p>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" disabled={!canSave}>{saving ? 'Saving…' : 'Save'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
