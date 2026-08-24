import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Can } from '@/casl/AbilityProvider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import DeleteConfirmDialog from '@/modules/classes/components/DeleteConfirmDialog'

const CATEGORY_LABEL = {
  science:  'Science',
  arts:     'Arts',
  commerce: 'Commerce',
  general:  'General',
}

export default function SubjectRow({ subject, saving, deleting, onEdit, onDelete }) {
  const [deleteOpen, setDeleteOpen] = useState(false)

  const busy = saving || deleting

  return (
    <div className="flex items-center justify-between gap-2 py-2">

      <div className="flex items-center gap-2 min-w-0">
        <div className="size-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
        <span className="text-sm font-medium text-foreground truncate">{subject.name}</span>
        {subject.name_initials && (
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono shrink-0">
            {subject.name_initials}
          </span>
        )}
        <Badge variant="outline" className="shrink-0 capitalize">
          {CATEGORY_LABEL[subject.category] ?? subject.category}
        </Badge>
      </div>

      <div className="flex items-center gap-0.5 shrink-0">
        <Can I="update" a="Subject">
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => onEdit(subject)}
            disabled={busy}
          >
            <Pencil className="size-3.5" />
          </Button>
        </Can>

        <Can I="delete" a="Subject">
          <Button
            size="icon-sm"
            variant="ghost"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
            disabled={busy}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </Can>
      </div>

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Subject"
        description={`"${subject.name}" will be permanently removed. This cannot be undone.`}
        onConfirm={() => onDelete(subject.id)}
        deleting={deleting}
      />

    </div>
  )
}
