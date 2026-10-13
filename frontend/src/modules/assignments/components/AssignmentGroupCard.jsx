import { ChevronRight, FileText, Paperclip } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { parseLocalDate } from '@/lib/dateUtils'
import { classLabelText, joinParts } from '@/modules/homework/utils/labels'
import RichText from '@/modules/homework/components/RichText'

const fmt = (d) =>
  parseLocalDate(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

const classText = (a) => classLabelText(a.classGroup?.name, a.section?.name)

const primaryText = (view, a) => {
  if (view === 'teacher') return joinParts(classText(a), a.subject?.name)
  if (view === 'subject') return joinParts(classText(a), a.postedBy?.full_name)
  return joinParts(a.subject?.name, a.postedBy?.full_name)
}

export default function AssignmentGroupCard({ group, rows, view, open, onToggle, onReport }) {
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
          {rows.map((a) => (
            <div key={a.id} className="space-y-1 px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium"><RichText text={primaryText(view, a)} ordinal /></span>
                <Badge variant="outline" className="text-xs capitalize">{a.type}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {a.assigned_date && <>Assigned {fmt(a.assigned_date)} · </>}Due {fmt(a.due_date)}
              </p>
              {a.description && (
                <p dir="auto" className="text-sm text-muted-foreground"><RichText text={a.description} /></p>
              )}
              {a.attachment_url && (
                <a
                  href={a.attachment_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Paperclip className="size-3" />{a.attachment_original_name ?? 'Attachment'}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}