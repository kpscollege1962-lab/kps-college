import { useEffect, useState } from 'react'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle2 } from 'lucide-react'
import { useClassFeeAssignment } from '../hooks/useClassFeeAssignment'

const CATEGORY_LABEL = { fees: 'Fees', facilities: 'Facilities Charges', fines: 'Fines' }
const CATEGORY_ORDER = ['fees', 'facilities', 'fines']

export default function ClassFeeAssignmentModal({ open, onOpenChange, campusId, sessionId, classGroup, onAssigned }) {
  const { setup, loading, error, assigning, fetchSetup, assignFees, clear } = useClassFeeAssignment(campusId)

  const [amounts, setAmounts]   = useState({}) // { feeHeadId: amountString }
  const [dueDay, setDueDay]     = useState('')
  const [submitError, setSubmitError] = useState(null)
  const [result, setResult]     = useState(null) // { structuresSaved, challanResult }

  useEffect(() => {
    if (open && classGroup) {
      setResult(null)
      setSubmitError(null)
      fetchSetup(classGroup.id, sessionId).then((res) => {
        if (res.success) {
          const prefilled = {}
          let anyDueDay = ''
          for (const cat of CATEGORY_ORDER) {
            for (const item of res.data.setup[cat]) {
              if (item.amount !== null) prefilled[item.feeHeadId] = String(item.amount)
              if (item.dueDay && !anyDueDay) anyDueDay = String(item.dueDay)
            }
          }
          setAmounts(prefilled)
          setDueDay(anyDueDay)
        }
      })
    }
  }, [open, classGroup, sessionId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = (isOpen) => {
    if (!isOpen) {
      clear()
      setAmounts({})
      setDueDay('')
      setResult(null)
      setSubmitError(null)
    }
    onOpenChange(isOpen)
  }

  const handleAmountChange = (feeHeadId, value) => {
    setAmounts((prev) => ({ ...prev, [feeHeadId]: value }))
  }

  const handleConfirm = async () => {
    setSubmitError(null)
    const items = Object.entries(amounts)
      .filter(([, val]) => val !== '' && parseFloat(val) > 0)
      .map(([feeHeadId, val]) => ({ feeHeadId: parseInt(feeHeadId), amount: parseFloat(val) }))

    if (items.length === 0) {
      setSubmitError('Enter at least one fee amount')
      return
    }
    if (!dueDay || parseInt(dueDay) < 1 || parseInt(dueDay) > 31) {
      setSubmitError('Enter a valid due day (1–31)')
      return
    }

    const res = await assignFees(classGroup.id, {
      sessionId,
      dueDay: parseInt(dueDay),
      items,
    })

    if (res.success) {
      setResult(res.data)
      onAssigned?.()
    } else {
      setSubmitError(res.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Fees — {classGroup?.name}</DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-lg" />
            ))}
          </div>
        )}

        {!loading && error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && !error && result && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="size-10 text-green-600" />
            <div>
              <p className="font-medium text-foreground">Fees assigned successfully</p>
              <p className="text-sm text-muted-foreground mt-1">
                {result.structuresSaved} fee head{result.structuresSaved !== 1 ? 's' : ''} set ·{' '}
                {result.challanResult.created} challan{result.challanResult.created !== 1 ? 's' : ''} generated
                {result.challanResult.skippedExisting > 0 && ` · ${result.challanResult.skippedExisting} already existed`}
              </p>
            </div>
            <Button size="sm" onClick={() => handleClose(false)}>Done</Button>
          </div>
        )}

        {!loading && !error && !result && setup && (
          <div className="space-y-5">
            {submitError && (
              <Alert variant="destructive">
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="due-day">Due Day of Month</Label>
              <Input
                id="due-day"
                type="number"
                min={1}
                max={31}
                placeholder="e.g. 10"
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                disabled={assigning}
                className="max-w-32"
              />
            </div>

            {CATEGORY_ORDER.map((cat) => (
              setup[cat]?.length > 0 && (
                <div key={cat} className="space-y-2.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {CATEGORY_LABEL[cat]}
                  </p>
                  <div className="space-y-2">
                    {setup[cat].map((item) => (
                      <div key={item.feeHeadId} className="flex items-center justify-between gap-3">
                        <Label htmlFor={`fh-${item.feeHeadId}`} className="text-sm font-normal flex-1">
                          {item.name}
                        </Label>
                        <Input
                          id={`fh-${item.feeHeadId}`}
                          type="number"
                          min={0}
                          step="0.01"
                          placeholder="0"
                          value={amounts[item.feeHeadId] ?? ''}
                          onChange={(e) => handleAmountChange(item.feeHeadId, e.target.value)}
                          disabled={assigning}
                          className="w-28 text-right"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        )}

        {!loading && !error && !result && (
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleClose(false)} disabled={assigning}>
              Cancel
            </Button>
            <Button type="button" onClick={handleConfirm} disabled={assigning}>
              {assigning ? 'Assigning…' : 'Confirm & Generate Challans'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}