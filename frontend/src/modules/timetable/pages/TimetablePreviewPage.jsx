import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { ArrowLeft, RefreshCw, Printer } from 'lucide-react'
import { toast } from 'sonner'
import { useRoleContext } from '@/modules/auth/hooks/useRoleContext'
import { useSessionContext } from '@/shells/portal/hooks/useSessionContext'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { useTimetablePreview } from '../hooks/useTimetablePreview'
import { usePrintScale } from '../hooks/usePrintScale'
import ClassWisePreview   from '../components/preview/ClassWisePreview'
import StaffWisePreview   from '../components/preview/StaffWisePreview'
import SubjectWisePreview from '../components/preview/SubjectWisePreview'
import '../styles/timetable-preview-print.css'

const LoadingSkeleton = () => (
  <div className="space-y-2">
    {Array.from({ length: 4 }).map((_, i) => (
      <Skeleton key={i} className="h-10 w-full rounded-lg" />
    ))}
  </div>
)

const ErrorState = ({ message }) => (
  <p className="text-center text-sm text-muted-foreground py-12">{message}</p>
)

export default function TimetablePreviewPage() {
  const navigate = useNavigate()

  const { activeRole } = useRoleContext()
  const campusId = activeRole.campusId

  const { activeSession } = useSessionContext()
  const sessionId = activeSession?.id ?? null

  const [activeTab, setActiveTab] = useState('class')

  const {
    classData, classLoading, classError, fetchClassWise,
    staffData, staffLoading, staffError, fetchStaffWise,
    subjectData, subjectLoading, subjectError, fetchSubjectWise,
  } = useTimetablePreview()

  const { gridRef, print } = usePrintScale()

  // Refetch on mount and whenever the active session changes. Also refetch
  // staff/subject tabs if they were already loaded, so a session switch
  // refreshes whichever tabs the user has visited, not just the default one.
  useEffect(() => {
    fetchClassWise(campusId, sessionId)
    if (staffData !== null) fetchStaffWise(campusId, sessionId)
    if (subjectData !== null) fetchSubjectWise(campusId, sessionId)
  }, [campusId, sessionId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (classError) toast.error(classError) }, [classError])
  useEffect(() => { if (staffError) toast.error(staffError) }, [staffError])
  useEffect(() => { if (subjectError) toast.error(subjectError) }, [subjectError])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (tab === 'staff' && staffData === null) {
      fetchStaffWise(campusId, sessionId)
    }
    if (tab === 'subject' && subjectData === null) {
      fetchSubjectWise(campusId, sessionId)
    }
  }

  const handleRefresh = () => {
    fetchClassWise(campusId, sessionId)
    if (staffData !== null) fetchStaffWise(campusId, sessionId)
    if (subjectData !== null) fetchSubjectWise(campusId, sessionId)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={() => navigate('/portal/timetable')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Timetable Preview</h1>
            <p className="text-xs text-muted-foreground">
              {activeSession?.name ?? 'No session selected'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon-sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={print} className="gap-1.5">
            <Printer className="h-3.5 w-3.5" />
            Print
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="class">Class-wise</TabsTrigger>
          <TabsTrigger value="staff">Staff-wise</TabsTrigger>
          <TabsTrigger value="subject">Subject-wise</TabsTrigger>
        </TabsList>

        <TabsContent value="class">
          {classLoading
            ? <LoadingSkeleton />
            : classError
              ? <ErrorState message={classError} />
              : classData
                ? <ClassWisePreview periods={classData.periods} rows={classData.rows} printRef={gridRef} />
                : null}
        </TabsContent>

        <TabsContent value="staff">
          {staffLoading
            ? <LoadingSkeleton />
            : staffError
              ? <ErrorState message={staffError} />
              : staffData
                ? <StaffWisePreview staff={staffData} periods={classData?.periods ?? []} printRef={gridRef} />
                : null}
        </TabsContent>

        <TabsContent value="subject">
          {subjectLoading
            ? <LoadingSkeleton />
            : subjectError
              ? <ErrorState message={subjectError} />
              : subjectData
                ? <SubjectWisePreview subjects={subjectData} periods={classData?.periods ?? []} printRef={gridRef} />
                : null}
        </TabsContent>
      </Tabs>
    </div>
  )
}
