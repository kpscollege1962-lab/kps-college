import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function HomeworkDialog({ open, onOpenChange, subjects, initialData, onSubmit, saving, error }) {
  const [title, setTitle]           = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate]       = useState('')
  const [subjectId, setSubjectId]   = useState('')
  const [file, setFile]             = useState(null)
  const isEdit = !!initialData

  useEffect(() => {
    if (open) {
      setTitle(initialData?.title ?? '')
      setDescription(initialData?.description ?? '')
      setDueDate(initialData?.due_date ?? '')
      setSubjectId(initialData?.subject?.id ? String(initialData.subject.id) : '')
      setFile(null)
    }
  }, [open, initialData, subjects])

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    formData.append('dueDate', dueDate)
    if (!isEdit) formData.append('subjectId', subjectId)
    if (file) formData.append('attachment', file)
    onSubmit(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Homework' : 'Post Homework'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

          {!isEdit && (
            <div className="space-y-1.5">
              <Label>Subject</Label>
              <Select value={subjectId} onValueChange={setSubjectId} disabled={saving}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject">
                    {(value) => subjects.find((s) => String(s.id) === value)?.name ?? 'Select subject'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="hw-title">Title</Label>
            <Input id="hw-title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={saving} autoFocus />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="hw-desc">Description</Label>
            <Textarea id="hw-desc" value={description} onChange={(e) => setDescription(e.target.value)} disabled={saving} rows={3} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="hw-due">Due Date</Label>
            <Input id="hw-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} disabled={saving} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="hw-file">Attachment (optional)</Label>
            <Input id="hw-file" type="file" accept=".pdf,.doc,.docx,image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} disabled={saving} />
            {isEdit && <p className="text-xs text-muted-foreground">Uploading a new file replaces the existing attachment.</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" disabled={saving || !title.trim() || !dueDate || (!isEdit && !subjectId)}>
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Post Homework'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}