import { useEffect } from 'react'
import { X, RefreshCw, AlertTriangle } from 'lucide-react'
import { Can } from '@/casl/AbilityProvider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useRoleContext } from '@/modules/auth/hooks/useRoleContext'
import { useSessionContext } from '@/shells/portal/hooks/useSessionContext'
import { useClassTeacherAssignments } from '../hooks/useClassTeacherAssignments'
import StaffAssignPopover from '../components/StaffAssignPopover'

export default function ClassTeacherAssignmentsPage() {
  const { activeRole }   = useRoleContext()
  const { activeSession } = useSessionContext()

  const campusId  = activeRole?.campusId
  const sessionId = activeSession?.id

  const {
    classes,
    loading,
    error,
    saving,
    deleting,
    fetchAssignments,
    addAssignment,
    removeAssignment,
  } = useClassTeacherAssignments(campusId, sessionId)

  useEffect(() => {
    if (campusId && sessionId) fetchAssignments()
  }, [campusId, sessionId]) // eslint-disable-line react-hooks/exhaustive-deps

  const sectionCount = classes.reduce((sum, c) => sum + c.sections.length, 0)
  const isEmpty = !loading && !error && classes.length === 0

  const handleAdd = (classGroupId, sectionId, member) => {
    addAssignment({
      campusId,
      sessionId,
      ...(sectionId !== null ? { sectionId } : { classGroupId }),
      staffId: member.id,
    })
  }

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Class Teacher Assignments</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading
              ? 'Loading…'
              : `${sectionCount} section${sectionCount !== 1 ? 's' : ''} across ${classes.length} class${classes.length !== 1 ? 'es' : ''}`}
            {activeSession?.name && !loading && (
              <span className="ml-1">— {activeSession.name}</span>
            )}
          </p>
        </div>
        {!isEmpty && (
          <Button size="sm" variant="outline" onClick={() => fetchAssignments()} disabled={loading}>
            <RefreshCw className="size-3.5 mr-1.5" />
            Refresh
          </Button>
        )}
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-4 space-y-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between gap-4">
            <span>{error}</span>
            <Button size="sm" variant="outline" onClick={() => fetchAssignments()}>Retry</Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Empty state */}
      {isEmpty && (
        <div className="flex flex-col items-center justify-center gap-2 py-20 border border-dashed border-border rounded-2xl">
          <p className="text-sm font-medium text-foreground">No classes found for this session.</p>
          <p className="text-xs text-muted-foreground">Set up classes first.</p>
        </div>
      )}

      {/* Class blocks */}
      {!loading && !error && classes.length > 0 && (
        <div className="space-y-4">
          {classes.map((cls) => (
            <div key={cls.classGroupId} className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <h2 className="text-sm font-semibold">{cls.className}</h2>
              </div>
              <div className="divide-y divide-border">
                {cls.sections.map((section) => (
                  <div key={section.sectionId ?? 'unsectioned'} className="px-4 py-3 flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1.5">
                      {section.sectionName && (
                        <p className="text-sm font-medium text-foreground">
                          {section.sectionName}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {section.assignments.map((assignment) => (
                          <Badge key={assignment.id} variant="secondary" className="gap-1">
                            {assignment.staffName}
                            <Can I="delete" a="ClassTeacherAssignment">
                              <button
                                type="button"
                                onClick={() => removeAssignment(assignment.id)}
                                disabled={deleting}
                                className="ml-0.5 -mr-1 rounded-full hover:bg-muted-foreground/20"
                              >
                                <X className="size-3" />
                              </button>
                            </Can>
                          </Badge>
                        ))}
                        {section.assignments.length === 0 && (
                          <p className="flex items-center gap-1 text-xs text-amber-600">
                            <AlertTriangle className="size-3.5" />
                            No class teacher assigned — this section has no responsible staff member
                          </p>
                        )}
                      </div>
                    </div>
                    <Can I="create" a="ClassTeacherAssignment">
                      <StaffAssignPopover
                        campusId={campusId}
                        disabled={saving}
                        onSelect={(member) => handleAdd(cls.classGroupId, section.sectionId, member)}
                      />
                    </Can>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
