import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { useRoleContext } from '@/modules/auth/hooks/useRoleContext'
import { useAttendanceRegister } from '../hooks/useAttendanceRegister'
import RegisterHeader from '../components/RegisterHeader'
import RegisterSkeleton from '../components/RegisterSkeleton'
import StudentMarkRow from '../components/StudentMarkRow'
import SubmittedRegisterTable from '../components/SubmittedRegisterTable'
import RegisterBottomBar from '../components/RegisterBottomBar'

export default function AttendanceRegisterPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const rawSectionId    = searchParams.get('sectionId')
  const rawClassGroupId = searchParams.get('classGroupId')
  const date            = searchParams.get('date')
  const sectionId       = rawSectionId    ? parseInt(rawSectionId)    : null
  const classGroupId    = rawClassGroupId ? parseInt(rawClassGroupId) : null

  const handleDateChange = (newDate) => {
    const params = new URLSearchParams(searchParams)
    params.set('date', newDate)
    setSearchParams(params)
  }

  const { activeRole } = useRoleContext()
  const campusId = activeRole?.campusId

  const {
    session, students, records, editable,
    loading, error,
    saving, saveError,
    submitting, submitError,
    reopening, reopenError,
    updateRecord, saveProgress, submitRegister, reopenRegister,
  } = useAttendanceRegister(campusId, { sectionId, classGroupId, date })

  const [confirmReopenOpen, setConfirmReopenOpen] = useState(false)

  useEffect(() => { if (saveError)   toast.error(saveError)   }, [saveError])
  useEffect(() => { if (submitError) toast.error(submitError) }, [submitError])
  useEffect(() => { if (reopenError) toast.error(reopenError) }, [reopenError])

  if (!date || (!sectionId && !classGroupId)) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 border border-dashed border-border rounded-2xl">
        <p className="text-sm font-medium text-foreground">No section selected — go back and pick a section.</p>
        <Button variant="outline" size="sm" onClick={() => navigate('/portal/attendance')}>
          <ArrowLeft className="size-3.5 mr-1.5" />
          Back to Attendance
        </Button>
      </div>
    )
  }

  if (loading) return <RegisterSkeleton />

  if (error && !session) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => navigate('/portal/attendance')}>
          <ArrowLeft className="size-3.5 mr-1.5" />
          Back to Attendance
        </Button>
      </div>
    )
  }

  if (!session) return null

  const markedCount = students.filter((s) => records[s.studentId]?.status).length
  const allMarked   = students.length > 0 && markedCount === students.length

  return (
    <div className="flex flex-col min-h-full gap-6">

      <RegisterHeader
        session={session}
        date={date}
        onDateChange={handleDateChange}
        onBack={() => navigate('/portal/attendance')}
        reopening={reopening}
        onRequestReopen={() => setConfirmReopenOpen(true)}
      />

      <div className="flex-1 flex flex-col gap-6">
        {!editable ? (
          <SubmittedRegisterTable
            students={students}
            records={records}
            onBack={() => navigate('/portal/attendance')}
          />
        ) : (
          <div className="bg-card border border-border rounded-2xl divide-y divide-border">
            {students.map((student) => (
              <StudentMarkRow
                key={student.studentId}
                student={student}
                record={records[student.studentId] ?? { status: null, remarks: '' }}
                onUpdate={updateRecord}
              />
            ))}
          </div>
        )}
      </div>

      {editable && (
        <RegisterBottomBar
          markedCount={markedCount}
          total={students.length}
          saving={saving}
          submitting={submitting}
          allMarked={allMarked}
          onSave={saveProgress}
          onSubmit={submitRegister}
        />
      )}

      <AlertDialog open={confirmReopenOpen} onOpenChange={setConfirmReopenOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reopen register?</AlertDialogTitle>
            <AlertDialogDescription>
              This will unlock the register for editing. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={reopening}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                const result = await reopenRegister()
                if (result.success) setConfirmReopenOpen(false)
              }}
              disabled={reopening}
            >
              {reopening ? 'Reopening…' : 'Reopen'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
