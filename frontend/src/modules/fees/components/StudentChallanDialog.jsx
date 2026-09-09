import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useFeeChallans } from '../hooks/useFeeChallans'
import { useFeePayments } from '../hooks/useFeePayments'
import RecordPaymentDialog from './RecordPaymentDialog'

const STATUS_CONFIG = {
  paid:      { label: 'Paid',      className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0' },
  partial:   { label: 'Partial',   className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0' },
  unpaid:    { label: 'Unpaid',    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0' },
  overdue:   { label: 'Overdue',   className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0' },
  cancelled: { label: 'Cancelled', className: 'bg-muted text-muted-foreground border-0' },
}

const MONTH_LABEL = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function StudentChallanDialog({ open, onOpenChange, campusId, sessionId, enrollment }) {
  const { challans, loading, error, fetchChallans } = useFeeChallans(campusId)
  const { saving, recordPayment } = useFeePayments(campusId)
  const [payDialog, setPayDialog] = useState({ open: false, challan: null })

  const refetch = () => fetchChallans({ sessionId, enrollmentId: enrollment.id, limit: 50 })

  useEffect(() => {
    if (open && enrollment) refetch()
  }, [open, enrollment]) // eslint-disable-line react-hooks/exhaustive-deps

  const handlePaymentSubmit = async (data) => {
    const result = await recordPayment(payDialog.challan.id, data)
    if (result.success) {
      setPayDialog({ open: false, challan: null })
      refetch()
    }
    return result
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{enrollment?.student?.full_name}'s Fee Challans</DialogTitle>
          </DialogHeader>

          {loading && (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
            </div>
          )}

          {!loading && error && (
            <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
          )}

          {!loading && !error && challans.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No challans generated yet for this student.</p>
          )}

          {!loading && !error && challans.length > 0 && (
            <div className="space-y-3">
              {challans.map((challan) => {
                const config = STATUS_CONFIG[challan.status]
                const remaining = (parseFloat(challan.total_amount) - parseFloat(challan.paid_amount)).toFixed(2)
                return (
                  <div key={challan.id} className="border border-border rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{MONTH_LABEL[challan.month]} {challan.year}</span>
                      <Badge className={config?.className}>{config?.label ?? challan.status}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <p>Total: Rs. {parseFloat(challan.total_amount).toFixed(2)}</p>
                      <p>Paid: Rs. {parseFloat(challan.paid_amount).toFixed(2)}</p>
                      {challan.status !== 'paid' && challan.status !== 'cancelled' && (
                        <p className="text-foreground font-medium">Remaining: Rs. {remaining}</p>
                      )}
                    </div>
                    {(challan.status === 'unpaid' || challan.status === 'partial' || challan.status === 'overdue') && (
                      <Button size="sm" variant="outline" onClick={() => setPayDialog({ open: true, challan })}>
                        Record Payment
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <RecordPaymentDialog
        open={payDialog.open}
        onOpenChange={(isOpen) => !isOpen && setPayDialog({ open: false, challan: null })}
        challan={payDialog.challan}
        saving={saving}
        onSubmit={handlePaymentSubmit}
      />
    </>
  )
}