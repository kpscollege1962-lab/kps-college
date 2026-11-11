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

// hasAssembly:   the campus already has its assembly, so it can't be added again.
// isFirstPeriod: the campus has no periods yet; the first column is normally the assembly.
export default function AddPeriodDialog({
  open, onOpenChange, suggestedNumber, hasAssembly = false, isFirstPeriod = false, onSubmit, saving,
}) {
  const [periodNumber, setPeriodNumber] = useState(String(suggestedNumber ?? ''))
  const [isAssembly, setIsAssembly] = useState(false)

  useEffect(() => {
    if (!open) return
    setPeriodNumber(String(suggestedNumber ?? ''))
    setIsAssembly(!hasAssembly && isFirstPeriod)
  }, [open, suggestedNumber, hasAssembly, isFirstPeriod])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(isAssembly ? { isAssembly: true } : { periodNumber: parseInt(periodNumber) })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>{isAssembly ? 'Add Assembly' : 'Add Period'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!hasAssembly && (
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4 accent-primary"
                checked={isAssembly}
                onChange={(e) => setIsAssembly(e.target.checked)}
                disabled={saving}
              />
              This is the assembly
            </label>
          )}

          {!isAssembly && (
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
          )}

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
              {saving ? 'Adding…' : isAssembly ? 'Add Assembly' : 'Add Period'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}