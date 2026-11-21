import { useState } from 'react'
import { toast } from 'sonner'
import { RotateCcw, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import DeleteConfirmDialog from '@/modules/classes/components/DeleteConfirmDialog'
import { parseLocalDate } from '@/lib/dateUtils'
import { classLabelText, joinParts } from '@/modules/homework/utils/labels'
import RichText from '@/modules/homework/components/RichText'

const fmtDay = (d) =>
  parseLocalDate(String(d).slice(0, 10)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
const fmtWhen = (d) =>
  new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

const personName = (u) => (u ? joinParts(u.first_name, u.last_name) || u.username : 'Unknown')

// Soft-deleted assignments of this campus + session, newest deletion first.
// Restore brings one back (the server refuses with 409 if newer work exists for that day);
// Delete permanently removes it for good, after a confirmation.
export default function RecentlyDeletedList({ rows, loading, error, saving, onRestore, onPurge }) {
  const [purgeTarget, setPurgeTarget] = useState(null)

  const handleRestore = async (row) => {
    const result = await onRestore(row)
    if (result.success) toast.success('Assignment restored')
    else toast.error(result.message)
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
      </div>
    )
  }
  if (error) return <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-border py-14 text-center">
        <p className="text-sm font-medium text-foreground">Nothing has been deleted</p>
        <p className="text-xs text-muted-foreground">Deleted assignments of this campus and session show up here, ready to restore.</p>
      </div>
    )
  }

  const submissions = purgeTarget?.submissionCount ?? 0

  return (
    <>
      <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
        {rows.map((row) => (
          <div key={row.id} className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">
                  <RichText text={joinParts(classLabelText(row.classGroup?.name, row.section?.name), row.subject?.name)} ordinal />
                </span>
                <Badge variant="outline" className="text-xs capitalize">{row.type}</Badge>
                {row.submissionCount > 0 && (
                  <Badge variant="outline" className="text-xs">{row.submissionCount} submission{row.submissionCount === 1 ? '' : 's'}</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {row.postedBy?.full_name ?? 'Unknown teacher'} · Assigned {fmtDay(row.assigned_date)} · Due {fmtDay(row.due_date)}
              </p>
              {row.description && (
                <p dir="auto" className="line-clamp-2 text-sm text-muted-foreground"><RichText text={row.description} /></p>
              )}
              <p className="text-xs text-muted-foreground">
                Deleted by <span className="font-medium text-foreground">{personName(row.deletedBy)}</span> on {fmtWhen(row.deleted_at)}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button type="button" size="sm" variant="outline" disabled={saving} onClick={() => handleRestore(row)}>
                <RotateCcw className="mr-1.5 size-3.5" />
                Restore
              </Button>
              <Button type="button" size="sm" variant="outline" disabled={saving} onClick={() => setPurgeTarget(row)}
                className="text-destructive hover:text-destructive">
                <Trash2 className="mr-1.5 size-3.5" />
                Delete permanently
              </Button>
            </div>
          </div>
        ))}
      </div>

      <DeleteConfirmDialog
        open={!!purgeTarget}
        onOpenChange={(open) => { if (!open) setPurgeTarget(null) }}
        title="Delete permanently"
        description={
          submissions > 0
            ? `This cannot be undone. ${submissions} student submission${submissions === 1 ? '' : 's'} and their files will be deleted with it.`
            : 'This cannot be undone. The assignment and its attachment will be removed for good.'
        }
        onConfirm={async () => {
          const result = await onPurge(purgeTarget)
          if (result.success) toast.success('Assignment deleted permanently')
          return result
        }}
        deleting={saving}
      />
    </>
  )
}
