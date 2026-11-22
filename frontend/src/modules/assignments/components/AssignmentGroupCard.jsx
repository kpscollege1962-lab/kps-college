import { ChevronRight, FileText, Paperclip, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { parseLocalDate } from '@/lib/dateUtils'
import { classLabelText, joinParts } from '@/modules/homework/utils/labels'
import RichText from '@/modules/homework/components/RichText'
import WorkPair from '@/modules/my-classes/components/WorkPair'
import { groupAssignmentBoxes } from '@/modules/my-classes/utils/assignmentBoxes'

const fmt = (d) =>
  parseLocalDate(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

const classText = (a) => classLabelText(a.classGroup?.name, a.section?.name)

// Each box names what the group header doesn't already say, the teacher only once:
//   teacher-wise: class + subject;  subject-wise: class + teacher;  class-wise: subject + teacher
const boxTitle = (view, a) => {
  if (view === 'teacher') return joinParts(classText(a), a.subject?.name)
  if (view === 'subject') return joinParts(classText(a), a.postedBy?.full_name)
  return joinParts(a.subject?.name, a.postedBy?.full_name)
}

const firstRecord = (box) => box.records.classwork[0] ?? box.records.homework[0]

// One box per class + subject + teacher + dates: title (teacher named once), the dates at the
// top centre, then classwork and homework side by side (stacked when the text is long).
// onEdit / onDelete: optional (only passed to admins allowed to change assignments); both get
// the box's first record, and the page works on the whole box.
export default function AssignmentGroupCard({ group, rows, view, open, onToggle, onReport, onEdit, onDelete }) {
  const hasRows = rows.length > 0

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <button
          type="button"
          onClick={onToggle}
          disabled={!hasRows}
          className="flex min-w-0 flex-1 items-center gap-2 text-left disabled:cursor-default"
        >
          <ChevronRight
            className={cn('size-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-90', !hasRows && 'opacity-30')}
          />
          <span className="truncate text-sm font-semibold"><RichText text={group.label} ordinal /></span>
          {group.formMaster && (
            <span className="hidden truncate text-xs text-muted-foreground sm:inline">Form master: {group.formMaster}</span>
          )}
          <Badge variant="outline" className="shrink-0 text-xs">{rows.length}</Badge>
          {!hasRows && <span className="text-xs text-muted-foreground">No assignments</span>}
        </button>

        <Button size="sm" variant="outline" onClick={onReport} disabled={group.assignments.length === 0}>
          <FileText className="size-3.5 mr-1.5" />
          Report
        </Button>
      </div>

      {open && hasRows && (
        <div className="divide-y divide-border border-t border-border">
          {groupAssignmentBoxes(rows, { byTeacher: true }).map((box) => {
            const first = firstRecord(box)
            const files = [...box.records.classwork, ...box.records.homework].filter((r) => r.attachment_url)
            return (
              <div key={box.key}>
                <div className="grid grid-cols-1 items-center gap-1 px-4 pt-3 sm:grid-cols-[1fr_auto_1fr] sm:gap-3">
                  <span className="min-w-0 text-sm font-semibold"><RichText text={boxTitle(view, first)} ordinal /></span>
                  <span className="text-xs text-muted-foreground sm:text-center">
                    Assigned {fmt(box.assignedDate)} · Due {fmt(box.dueDate)}
                  </span>
                  {(onEdit || onDelete) ? (
                    <span className="flex gap-1 sm:justify-end">
                      {onEdit && (
                        <Button type="button" size="sm" variant="ghost" onClick={() => onEdit(first)} aria-label="Edit assignment">
                          <Pencil className="size-3.5" />
                          <span className="ml-1.5 hidden sm:inline">Edit</span>
                        </Button>
                      )}
                      {onDelete && (
                        <Button type="button" size="sm" variant="ghost" onClick={() => onDelete(first)} aria-label="Delete assignment"
                          className="text-destructive hover:text-destructive">
                          <Trash2 className="size-3.5" />
                          <span className="ml-1.5 hidden sm:inline">Delete</span>
                        </Button>
                      )}
                    </span>
                  ) : <span />}
                </div>
                <WorkPair classwork={box.records.classwork} homework={box.records.homework} />
                {files.length > 0 && (
                  <div className="flex flex-wrap gap-3 px-4 pb-3">
                    {files.map((r) => (
                      <a key={r.id} href={r.attachment_url} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                        <Paperclip className="size-3" />{r.attachment_original_name ?? 'Attachment'}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}