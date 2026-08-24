import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AddPeriodDialog({ open, onOpenChange, suggestedNumber, onSubmit, saving }) {
  const [periodNumber, setPeriodNumber] = useState(String(suggestedNumber ?? ''))

  // Sync suggested number when dialog opens
  useEffect(() => {
    if (open) setPeriodNumber(String(suggestedNumber ?? ''))
  }, [open, suggestedNumber])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ periodNumber: parseInt(periodNumber) })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>Add Period</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="period-number">Period Number</Label>
            <Input
              id="period-number"
              type="number"
              min={1}
              value={periodNumber}
              onChange={(e) => setPeriodNumber(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? 'Adding…' : 'Add Period'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
