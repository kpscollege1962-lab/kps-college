import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ArrowLeft, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useRoleContext } from '@/modules/auth/hooks/useRoleContext'
import { useSessionContext } from '@/shells/portal/hooks/useSessionContext'
import { useClasses } from '@/modules/classes/hooks/useClasses'
import { useFeeClassStudents } from '../hooks/useFeeClassStudents'
import ClassFeeAssignmentModal from '../components/ClassFeeAssignmentModal'
import FeeClassCard from '../components/FeeClassCard'

export default function FeeClassesPage() {
  const { activeRole }              = useRoleContext()
  const { activeSession }           = useSessionContext()

  const campusId  = activeRole?.campusId
  const sessionId = activeSession?.id

  const { classes, loading: classesLoading, error: classesError, fetchClasses } = useClasses(campusId, sessionId)
  const {
    selectedClass,
    students,
    total,
    loading: studentsLoading,
    error: studentsError,
    fetchStudentsForClass,
    clearSelection,
  } = useFeeClassStudents(campusId, sessionId)

  const [feeModalClass, setFeeModalClass] = useState(null)

  useEffect(() => {
    if (campusId && sessionId) fetchClasses()
  }, [campusId, sessionId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Detail view: students within a selected class ────────────────────────
  if (selectedClass) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button size="icon-sm" variant="ghost" onClick={clearSelection}>
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{selectedClass.name}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {studentsLoading ? 'Loading…' : `${total} student${total !== 1 ? 's' : ''} enrolled`}
              </p>
            </div>
          </div>
        </div>

        {studentsLoading && (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        )}

        {!studentsLoading && studentsError && (
          <Alert variant="destructive">
            <AlertDescription>{studentsError}</AlertDescription>
          </Alert>
        )}

        {!studentsLoading && !studentsError && students.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-20 border border-dashed border-border rounded-2xl">
            <p className="text-sm font-medium text-foreground">No students enrolled in this class yet</p>
          </div>
        )}

        {!studentsLoading && !studentsError && students.length > 0 && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Class No</th>
                  <th className="px-4 py-2.5 font-medium">Student</th>
                  <th className="px-4 py-2.5 font-medium">GR No</th>
                  <th className="px-4 py-2.5 font-medium">Section</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.map((enr) => (
                  <tr key={enr.id}>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                        {enr.class_no}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {enr.student?.full_name ?? '—'}
                    </td>
                    <td className="px-4 py-3 font-mono">{enr.student?.gr_no ?? '—'}</td>
                    <td className="px-4 py-3">{enr.section?.name ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }

  // ── List view: all classes ────────────────────────────────────────────────
  const isEmpty = !classesLoading && !classesError && classes.length === 0

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fees</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Select a class to view students and manage fees</p>
        </div>
        <Button size="sm" variant="outline" className="shrink-0" asChild>
          <Link to="/portal/fees/fee-heads">
            <Settings className="size-3.5 mr-1.5" />
            Fee Heads
          </Link>
        </Button>
      </div>

      {classesLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {!classesLoading && classesError && (
        <Alert variant="destructive">
          <AlertDescription>{classesError}</AlertDescription>
        </Alert>
      )}

      {isEmpty && (
        <div className="flex flex-col items-center justify-center gap-2 py-20 border border-dashed border-border rounded-2xl">
          <p className="text-sm font-medium text-foreground">No classes set up for this session yet</p>
        </div>
      )}

      {!classesLoading && !classesError && classes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <FeeClassCard
              key={cls.id}
              classGroup={cls}
              onViewStudents={() => fetchStudentsForClass(cls)}
              onAssignFees={() => setFeeModalClass(cls)}
            />
          ))}
        </div>
      )}

      <ClassFeeAssignmentModal
        open={!!feeModalClass}
        onOpenChange={(open) => !open && setFeeModalClass(null)}
        campusId={campusId}
        sessionId={sessionId}
        classGroup={feeModalClass}
        onAssigned={() => {}}
      />
    </div>
  )
}