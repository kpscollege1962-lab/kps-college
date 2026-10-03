import { useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useSubmissions } from '../hooks/useSubmissions'

export default function SubmissionsDialog({ open, onOpenChange, campusId, homework }) {
  const { submissions, loading, error, marking, fetchSubmissions, markDone } = useSubmissions(campusId)

  useEffect(() => {
    if (open && homework) fetchSubmissions(homework.id)
  }, [open, homework, fetchSubmissions])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submissions — {homework?.title}</DialogTitle>
        </DialogHeader>

        {loading && <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>}
        {!loading && error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        {!loading && !error && submissions.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No submissions yet.</p>
        )}

        {!loading && !error && submissions.length > 0 && (
          <div className="space-y-2">
            {submissions.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between gap-3 border border-border rounded-xl px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{sub.enrollment?.student?.full_name}</p>
                  <a href={sub.file_url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">
                    {sub.file_original_name ?? 'View file'}
                  </a>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge className={sub.status === 'done' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0'}>
                    {sub.status === 'done' ? 'Done' : 'Submitted'}
                  </Badge>
                  {sub.status !== 'done' && (
                    <Button size="sm" variant="outline" disabled={marking} onClick={() => markDone(homework.id, sub.id)}>
                      Mark Done
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}