import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useRoleContext } from '@/modules/auth/hooks/useRoleContext'
import { useSessionContext } from '@/shells/portal/hooks/useSessionContext'
import { listEnrollmentsService } from '@/modules/enrollments/services/enrollments.service'

export default function MyClassStudentsPage() {
  const { classGroupId, sectionId } = useParams()
  const { activeRole } = useRoleContext()
  const { activeSession } = useSessionContext()
  const campusId = activeRole?.campusId
  const sessionId = activeSession?.id

  const [students, setStudents] = useState([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  useEffect(() => {
    if (!campusId || !sessionId) return
    setLoading(true)
    setError(null)
    listEnrollmentsService({
      campusId, sessionId,
      classGroupId: Number(classGroupId),
      sectionId: Number(sectionId),
      status: 'active',
      limit: 100,
    }).then((result) => {
      setLoading(false)
      if (result.success) setStudents(result.data.data)
      else setError(result.message)
    })
  }, [campusId, sessionId, classGroupId, sectionId])

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
      </div>
    )
  }
  if (error) return <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-20 border border-dashed border-border rounded-2xl">
        <p className="text-sm font-medium text-foreground">No students enrolled in this class yet</p>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th className="px-4 py-2.5 font-medium">Class No</th>
            <th className="px-4 py-2.5 font-medium">Student</th>
            <th className="px-4 py-2.5 font-medium">GR No</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {students.map((enr) => (
            <tr key={enr.id}>
              <td className="px-4 py-3">
                <span className="font-mono text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">{enr.class_no}</span>
              </td>
              <td className="px-4 py-3 font-medium text-foreground">{enr.student?.full_name ?? '—'}</td>
              <td className="px-4 py-3 font-mono">{enr.student?.gr_no ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}