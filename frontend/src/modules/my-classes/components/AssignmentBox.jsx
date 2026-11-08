import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { parseLocalDate } from '@/lib/dateUtils'
import RichText from '@/modules/homework/components/RichText'

const fmt = (d) =>
  parseLocalDate(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

const lineText = (record, index, count) => {
  const text = record.description?.trim() || (record.attachment_url ? 'See attached file' : '—')
  return count > 1 ? `${index + 1}. ${text}` : text
}

function WorkRow({ label, records }) {
  return (
    <div className="flex gap-4 px-4 py-2.5 text-sm">
      <span className="w-24 shrink-0 text-muted-foreground">{label}</span>
      <div className="min-w-0 flex-1 space-y-1">
        {records.length === 0 ? (
          <p className="text-muted-foreground">—</p>
        ) : (
          records.map((record, i) => (
            <p key={record.id} dir="auto" className="whitespace-pre-wrap">
              <RichText text={lineText(record, i, records.length)} />
            </p>
          ))
        )}
      </div>
    </div>
  )
}

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

      <div className="divide-y divide-border/60">
        <WorkRow label="Class work:" records={box.records.classwork} />
        <WorkRow label="Home work:" records={box.records.homework} />
      </div>
    </div>
  )
}