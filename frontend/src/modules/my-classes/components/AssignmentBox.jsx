import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { parseLocalDate } from '@/lib/dateUtils'
import RichText from '@/modules/homework/components/RichText'
import WorkPair from './WorkPair'

const fmt = (d) =>
  parseLocalDate(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

export default function AssignmentBox({ box, onEdit, onDelete }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">
            {box.subjectName} (<RichText text={box.classLabel} ordinal />)
          </p>
          <p className="text-xs text-muted-foreground">
            Assigned {fmt(box.assignedDate)} · Due {fmt(box.dueDate)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <Button size="icon-sm" variant="ghost" onClick={() => onEdit(box)} title="Edit">
            <Pencil className="size-3.5" />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            className="text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(box)}
            title="Delete"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>

      <WorkPair classwork={box.records.classwork} homework={box.records.homework} />
    </div>
  )
}