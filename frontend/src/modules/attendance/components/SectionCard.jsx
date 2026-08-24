import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/dateUtils'

const BREAKDOWN_LABELS = { present: 'Present', absent: 'Absent', late: 'Late', leave: 'Leave' }

function Breakdown({ breakdown }) {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
      {Object.entries(BREAKDOWN_LABELS).map(([key, label]) => (
        <span key={key}>{label}: {breakdown[key]}</span>
      ))}
    </div>
  )
}

export default function SectionCard({ section, onOpen }) {
  const { registerStatus, enrolledCount, recordCount, breakdown, submittedAt, markedByName } = section
  const noEnrollments = enrolledCount === 0

  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-sm font-semibold">
          {section.className}{section.sectionName ? ` — ${section.sectionName}` : ''}
        </h2>
        {registerStatus === 'not_marked' && <Badge variant="outline">Not Marked</Badge>}
        {registerStatus === 'draft' && <Badge className="bg-amber-100 text-amber-700">In Progress</Badge>}
        {registerStatus === 'submitted' && <Badge className="bg-green-100 text-green-700">Submitted</Badge>}
      </div>

      {registerStatus === 'not_marked' && (
        <p className="text-xs text-muted-foreground">
          {enrolledCount} {enrolledCount === 1 ? 'student' : 'students'} enrolled
        </p>
      )}

      {registerStatus === 'draft' && (
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">{recordCount}/{enrolledCount} marked</p>
          <Breakdown breakdown={breakdown} />
        </div>
      )}

      {registerStatus === 'submitted' && (
        <div className="space-y-1.5">
          <Breakdown breakdown={breakdown} />
          <p className="text-xs text-muted-foreground">
            {submittedAt ? `Submitted ${formatDate(submittedAt)}` : 'Submitted'}
            {markedByName ? ` by ${markedByName}` : ''}
          </p>
        </div>
      )}

      <Button className="w-full" size="sm" onClick={onOpen} disabled={noEnrollments}>
        {noEnrollments ? 'No Students Enrolled' : 'Open Register'}
      </Button>
    </div>
  )
}