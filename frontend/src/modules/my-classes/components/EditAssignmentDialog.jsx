import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import RichText from '@/modules/homework/components/RichText'
import { joinRecordTexts } from '../utils/assignmentBoxes'

export default function EditAssignmentDialog({ open, onOpenChange, box, saving, onSave }) {
  const [classwork, setClasswork] = useState('')
  const [homework, setHomework] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!open || !box) return
    setClasswork(joinRecordTexts(box.records.classwork))
    setHomework(joinRecordTexts(box.records.homework))
    setError(null)
  }, [open, box])

  const canSave = !saving && Boolean(classwork.trim() || homework.trim())

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSave) return
    setError(null)
    const result = await onSave({ classwork, homework })
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
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

          <div className="space-y-1.5">
            <Label htmlFor="edit-classwork">Classwork</Label>
            <Textarea id="edit-classwork" dir="auto" rows={3} value={classwork} onChange={(e) => setClasswork(e.target.value)} disabled={saving} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-homework">Homework</Label>
            <Textarea id="edit-homework" dir="auto" rows={3} value={homework} onChange={(e) => setHomework(e.target.value)} disabled={saving} />
          </div>
          <p className="text-xs text-muted-foreground">Leave a field empty to remove it.</p>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" disabled={!canSave}>{saving ? 'Saving…' : 'Save'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}