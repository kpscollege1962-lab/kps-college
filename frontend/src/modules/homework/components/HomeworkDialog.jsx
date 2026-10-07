import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'

const TYPE_OPTIONS = [
  { value: 'homework', label: 'Homework' },
  { value: 'classwork', label: 'Classwork' },
]
const TYPE_LABEL = { homework: 'Homework', classwork: 'Classwork' }

const getTomorrowDateString = () => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

export default function HomeworkDialog({ open, onOpenChange, subjects, initialData, onSubmit, saving, error }) {
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate]       = useState('')
  const [subjectId, setSubjectId]   = useState('')
  const [type, setType]             = useState('homework')
  const [file, setFile]             = useState(null)
  const isEdit = !!initialData
  const minDate = getTomorrowDateString()

  useEffect(() => {
    if (open) {
      setDescription(initialData?.description ?? '')
      setDueDate(initialData?.due_date ?? getTomorrowDateString())
      setType(initialData?.type ?? 'homework')
      setSubjectId(
        initialData?.subject?.id
          ? String(initialData.subject.id)
          : subjects.length === 1
            ? String(subjects[0].id)
            : ''
      )
      setFile(null)
    }
  }, [open, initialData, subjects])

  const subjectName = isEdit
    ? initialData?.subject?.name
    : subjects.find((s) => String(s.id) === subjectId)?.name

  const computedTitle = subjectName ? `${subjectName} ${TYPE_LABEL[type]}` : TYPE_LABEL[type]

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('title', computedTitle)
    formData.append('description', description)
    formData.append('dueDate', dueDate)
    formData.append('type', type)
    if (!isEdit) formData.append('subjectId', subjectId)
    if (file) formData.append('attachment', file)
    onSubmit(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Assignment' : 'Post Assignment'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={type} onValueChange={setType} disabled={saving}>
              <SelectTrigger>
                <SelectValue placeholder="Select type">
                  {(value) => TYPE_OPTIONS.find((t) => t.value === value)?.label ?? 'Select type'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
            <Label htmlFor="hw-desc">Description</Label>
            <Textarea id="hw-desc" value={description} onChange={(e) => setDescription(e.target.value)} disabled={saving} rows={3} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="hw-due">Due Date</Label>
            <Input
              id="hw-due"
              type="date"
              value={dueDate}
              min={minDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="hw-file">Attachment (optional)</Label>
            <Input id="hw-file" type="file" accept=".pdf,.doc,.docx,image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} disabled={saving} />
            {isEdit && <p className="text-xs text-muted-foreground">Uploading a new file replaces the existing attachment.</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" disabled={saving || !dueDate || (!isEdit && !subjectId)}>
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Post Assignment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}