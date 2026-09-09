import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'

const METHOD_OPTIONS = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'online', label: 'Online' },
  { value: 'cheque', label: 'Cheque' },
]

export default function RecordPaymentDialog({ open, onOpenChange, challan, saving, onSubmit }) {
  const remaining = challan ? (parseFloat(challan.total_amount) - parseFloat(challan.paid_amount)).toFixed(2) : '0'

  const [amount, setAmount]         = useState('')
  const [method, setMethod]         = useState('cash')
  const [referenceNo, setReferenceNo] = useState('')
  const [error, setError]           = useState(null)

  const handleOpenChange = (isOpen) => {
    if (isOpen) {
      setAmount(remaining)
      setMethod('cash')
      setReferenceNo('')
      setError(null)
    }
    onOpenChange(isOpen)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    const result = await onSubmit({
      amount: parseFloat(amount),
      method,
      referenceNo: referenceNo || undefined,
    })
    if (!result.success) setError(result.message)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Payment — {challan?.month}/{challan?.year}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
          )}

          <p className="text-sm text-muted-foreground">
            Remaining balance: <span className="font-medium text-foreground">Rs. {remaining}</span>
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="payment-amount">Amount</Label>
            <Input
              id="payment-amount"
              type="number"
              min={0.01}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={saving}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="payment-method">Method</Label>
            <Select value={method} onValueChange={setMethod} disabled={saving}>
              <SelectTrigger id="payment-method"><SelectValue /></SelectTrigger>
              <SelectContent>
                {METHOD_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="payment-reference">Reference No. (optional)</Label>
            <Input
              id="payment-reference"
              placeholder="Transaction ID, cheque number…"
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              disabled={saving}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !amount || parseFloat(amount) <= 0}>
              {saving ? 'Recording…' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}