import { Can } from '@/casl/AbilityProvider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function CampusRow({ campus, onEdit, saving }) {
  return (
    <div className="flex items-center justify-between gap-4 px-6 py-4">

      {/* Info */}
      <div className="min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-foreground">{campus.name}</p>

          {campus.code && (
            <Badge variant="secondary" className="font-mono">{campus.code}</Badge>
          )}

          <Badge
            variant={campus.is_active ? 'secondary' : 'outline'}
            className={campus.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
          >
            {campus.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        {(campus.address || campus.phone || campus.email) && (
          <p className="text-xs text-muted-foreground truncate">
            {[campus.address, campus.phone, campus.email].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <Can I="update" a="Campus">
          <Button size="sm" variant="outline" onClick={() => onEdit(campus)} disabled={saving}>
            Edit
          </Button>
        </Can>
      </div>

    </div>
  )
}
