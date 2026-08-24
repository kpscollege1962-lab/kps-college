import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Can } from '@/casl/AbilityProvider'
import { Button } from '@/components/ui/button'
import DeleteConfirmDialog from './DeleteConfirmDialog'

export default function SectionRow({ section, classGroupId, saving, deleting, onEdit, onDelete }) {
  const [deleteOpen, setDeleteOpen] = useState(false)

  const busy = saving || deleting

  return (
    <div className="flex items-center justify-between gap-1 py-1">
      <div className="flex items-center gap-2 min-w-0">
        <div className="size-1 rounded-full bg-muted-foreground/30 shrink-0" />
        <span className="text-xs font-medium text-foreground truncate">{section.name}</span>
      </div>

      <div className="flex items-center gap-0.5 shrink-0">
        <Can I="update" a="ClassGroup">
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => onEdit(section)}
            disabled={busy}
          >
            <Pencil className="size-3" />
          </Button>
        </Can>

        <Can I="delete" a="ClassGroup">
          <Button
            size="icon-sm"
            variant="ghost"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
            disabled={busy}
          >
            <Trash2 className="size-3" />
          </Button>
        </Can>
      </div>

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Section"
        description={`"${section.name}" will be permanently removed from this class. This cannot be undone.`}
        onConfirm={() => onDelete(classGroupId, section.id)}
        deleting={deleting}
      />
    </div>
  )
}
