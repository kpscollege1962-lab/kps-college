import { useMemo, useState } from 'react'
import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/modules/auth/hooks/useAuth'
import { useRoleContext } from '@/modules/auth/hooks/useRoleContext'
import { useSessionContext } from '@/shells/portal/hooks/useSessionContext'
import HomeworkReportDialog from '@/modules/homework/components/HomeworkReportDialog'
import { useMyTimetable } from '../hooks/useMyTimetable'
import { buildCards, buildTargets, buildClasses } from '../utils/timetableEntries'
import TeacherTimetable from '../components/TeacherTimetable'
import AssignmentsSection from '../components/AssignmentsSection'

// The teacher's home for their classes: their timetable on top, the assignments below.
// A timetable card opens that class (its students).
export default function ManageClassesPage() {
  const { user } = useAuth()
  const { activeRole } = useRoleContext()
  const { activeSession } = useSessionContext()
  const campusId = activeRole?.campusId
  const sessionId = activeSession?.id

  const { entries, loading, error } = useMyTimetable(campusId)
  const [reportOpen, setReportOpen] = useState(false)

  const cards = useMemo(() => buildCards(entries), [entries])
  const targets = useMemo(() => buildTargets(entries), [entries])
  const classes = useMemo(() => buildClasses(entries), [entries])

  const userFullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Manage classes</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Your timetable and the assignments you give to your classes.
        </p>
      </div>

      <TeacherTimetable cards={cards} loading={loading} error={error} />

      <AssignmentsSection
        campusId={campusId}
        sessionId={sessionId}
        targets={targets}
        timetableLoading={loading}
      />

      <div className="flex justify-end pt-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setReportOpen(true)}
          disabled={loading || classes.length === 0}
        >
          <FileText className="mr-1.5 size-3.5" />
          Show Report
        </Button>
      </div>

      <HomeworkReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        campusId={campusId}
        sessionId={sessionId}
        classes={classes}
        fallbackTeacherName={userFullName}
      />
    </div>
  )
}