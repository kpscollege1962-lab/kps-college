import { Pencil, Trash2 } from 'lucide-react'
import { Can } from '@/casl/AbilityProvider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/dateUtils'

const STATUS_BADGE_CLASSES = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  upcoming: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  closing: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

const STATUS_LABELS = {
  active: 'Active',
  upcoming: 'Upcoming',
  closing: 'Closing',
  completed: 'Completed',
}

const TRANSITION_BUTTON = {
  upcoming: { label: 'Activate', variant: 'default' },
  active: { label: 'Mark as Closing', variant: 'outline' },
  closing: { label: 'Mark as Completed', variant: 'outline' },
}

const DELETABLE_STATUSES = ['upcoming', 'active']

export default function AcademicSessionRow({
  session,
  onEdit,
  onTransitionRequest,
  onDelete,
  saving,
  transitioning,
  deleting,
}) {
  const transitionBtn = TRANSITION_BUTTON[session.status]
  const busy = saving || transitioning || deleting

  return (
    <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">

      {/* Info */}
      <div className="min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-foreground">{session.name}</p>
          <Badge
            variant="secondary"
            className={STATUS_BADGE_CLASSES[session.status] ?? ''}
          >
            {STATUS_LABELS[session.status] ?? session.status}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {formatDate(session.start_date)} → {formatDate(session.end_date)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        {transitionBtn && (
          <Can I="update" a="AcademicSession">
            <Button
              size="sm"
              variant={transitionBtn.variant}
              onClick={() => onTransitionRequest(session)}
              disabled={busy}
            >
              {transitionBtn.label}
            </Button>
          </Can>
        )}

        {session.status !== 'completed' && (
          <Can I="update" a="AcademicSession">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(session)}
              disabled={busy}
            >
              <Pencil className="size-3.5" />
            </Button>
          </Can>
        )}

        {DELETABLE_STATUSES.includes(session.status) && (
          <Can I="delete" a="AcademicSession">
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onDelete(session)}
              disabled={busy}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </Can>
        )}
      </div>

    </div>
  )
}
