import { useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useMyFeeChallans } from '../hooks/useMyFeeChallans'

const STATUS_CONFIG = {
  paid:      { label: 'Paid',      className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0' },
  partial:   { label: 'Partial',   className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0' },
  unpaid:    { label: 'Unpaid',    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0' },
  overdue:   { label: 'Overdue',   className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0' },
  cancelled: { label: 'Cancelled', className: 'bg-muted text-muted-foreground border-0' },
}

const MONTH_LABEL = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function MyFeesPage() {
  const { challans, loading, error, fetchMyChallans } = useMyFeeChallans()

  useEffect(() => {
    fetchMyChallans()
  }, [fetchMyChallans])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Fees</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          View your fee challans for this session. Payments are collected at the accounts office.
        </p>
      </div>

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {!loading && error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && challans.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 py-20 border border-dashed border-border rounded-2xl">
          <p className="text-sm font-medium text-foreground">No fee challans yet</p>
        </div>
      )}

      {!loading && !error && challans.length > 0 && (
        <div className="space-y-3">
          {challans.map((challan) => {
            const config    = STATUS_CONFIG[challan.status]
            const remaining = (parseFloat(challan.total_amount) - parseFloat(challan.paid_amount)).toFixed(2)
            return (
              <div key={challan.id} className="bg-card border border-border rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-foreground">
                    {MONTH_LABEL[challan.month]} {challan.year}
                  </span>
                  <Badge className={config?.className}>{config?.label ?? challan.status}</Badge>
                </div>

                <div className="divide-y divide-border/50 text-sm">
                  {(challan.items ?? []).map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-1.5">
                      <span className="text-muted-foreground">{item.feeHead?.name}</span>
                      <span>Rs. {parseFloat(item.amount).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-medium">Rs. {parseFloat(challan.total_amount).toFixed(2)}</span>
                </div>
                {challan.status !== 'paid' && challan.status !== 'cancelled' && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Remaining</span>
                    <span className="font-medium text-destructive">Rs. {remaining}</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Due {new Date(challan.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}