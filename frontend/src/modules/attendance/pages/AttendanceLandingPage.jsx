import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { format } from 'date-fns'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DatePicker } from '@/components/ui/date-picker'
import { Can } from '@/casl/AbilityProvider'
import { useSessionContext } from '@/shells/portal/hooks/useSessionContext'
import { useRoleContext } from '@/modules/auth/hooks/useRoleContext'
import { useAttendanceSections } from '../hooks/useAttendanceSections'
import SectionCard from '../components/SectionCard'

export default function AttendanceLandingPage() {
  const navigate = useNavigate()
  const { activeSession } = useSessionContext()
  const { activeRole } = useRoleContext()
  const campusId = activeRole?.campusId

  const { sections, loading: sectionsLoading, error: sectionsError, fetchMySections } = useAttendanceSections(campusId)

  const [date, setDate] = useState(() => format(new Date(), 'yyyy-MM-dd'))

  useEffect(() => {
    if (activeSession?.id && date) fetchMySections(activeSession.id, date)
  }, [activeSession?.id, date]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpenRegister = (section) => {
    const params = new URLSearchParams({ date })
    if (section.sectionName !== null) {
      params.set('sectionId', section.sectionId)
    } else {
      params.set('classGroupId', section.classGroupId)
    }
    navigate(`/portal/attendance/register?${params.toString()}`)
  }

  const isEmpty = !sectionsLoading && !sectionsError && sections.length === 0

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Attendance</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Select a section to mark attendance</p>
        </div>
        <div className="flex items-center gap-2">
          <DatePicker value={date} onChange={setDate} className="w-40" />
          {!isEmpty && (
            <Button size="sm" variant="outline" onClick={() => fetchMySections(activeSession?.id, date)} disabled={sectionsLoading}>
              <RefreshCw className="size-3.5 mr-1.5" />
              Refresh
            </Button>
          )}
          <Can I="read" a="AttendanceReports">
            <Button variant="outline" onClick={() => navigate('/portal/attendance/reports')}>
              View Reports
            </Button>
          </Can>
        </div>
      </div>

      {sectionsLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-4 space-y-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
      )}

      {!sectionsLoading && sectionsError && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between gap-4">
            <span>{sectionsError}</span>
            <Button size="sm" variant="outline" onClick={() => fetchMySections(activeSession?.id, date)}>Retry</Button>
          </AlertDescription>
        </Alert>
      )}

      {isEmpty && (
        <div className="flex flex-col items-center justify-center gap-2 py-20 border border-dashed border-border rounded-2xl">
          <p className="text-sm font-medium text-foreground">No classes found for this session.</p>
          <p className="text-xs text-muted-foreground">Classes and sections will appear here once configured for this session.</p>
        </div>
      )}

      {!sectionsLoading && !sectionsError && sections.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <SectionCard
              key={section.sectionId}
              section={section}
              onOpen={() => handleOpenRegister(section)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
