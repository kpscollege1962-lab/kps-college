import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'

const CATEGORY_OPTIONS = [
  { value: 'fees',       label: 'Fees' },
  { value: 'facilities', label: 'Facilities Charges' },
  { value: 'fines',      label: 'Fines' },
]

export default function FeeHeadDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  saving,
  error,
  fieldErrors,
}) {
  const [name, setName]         = useState('')
  const [category, setCategory] = useState('fees')
  const isEdit = !!initialData

  useEffect(() => {
    if (open) {
      setName(initialData?.name ?? '')
      setCategory(initialData?.category ?? 'fees')
    }
  }, [open, initialData])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ name, category })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Fee Head' : 'Add Fee Head'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="fee-head-name">Name</Label>
            <Input
              id="fee-head-name"
              placeholder="e.g. Tuition Fee"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving}
              autoFocus
            />
            {fieldErrors?.name && (
              <p className="text-xs text-destructive">{fieldErrors.name}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fee-head-category">Category</Label>
            <Select value={category} onValueChange={setCategory} disabled={saving}>
              <SelectTrigger id="fee-head-category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors?.category && (
              <p className="text-xs text-destructive">{fieldErrors.category}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !name.trim()}>
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Fee Head'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}