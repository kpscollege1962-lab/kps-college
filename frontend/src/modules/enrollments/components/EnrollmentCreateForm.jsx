import { useSessionContext } from '@/shells/portal/hooks/useSessionContext'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import StudentSearchCombobox from './StudentSearchCombobox'
import { useState } from 'react'

export default function EnrollmentCreateForm({
  campus,          // { id, name } — from filter context
  classGroup,      // { id, name } — from filter context
  section,         // { id, name } | null — from filter context (null if unsectioned)
  isUnsectioned,   // bool — true if the class has no named sections
  onSubmit,        // (studentId: number) => void
  onCancel,
  saving,
  error,
}) {
  const { activeSession } = useSessionContext()
  const [selectedStudent, setSelectedStudent] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!selectedStudent) return
    onSubmit(selectedStudent.id)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>

      {/* Context summary */}
      <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 space-y-1 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="font-medium text-foreground">{campus?.name ?? '—'}</span>
          <span>›</span>
          <span className="font-medium text-foreground">{classGroup?.name ?? '—'}</span>
          {!isUnsectioned && (
            <>
              <span>›</span>
              <span className="font-medium text-foreground">{section?.name ?? '—'}</span>
            </>
          )}
          {isUnsectioned && (
            <span className="text-xs text-muted-foreground">(unsectioned)</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Session: <span className="text-foreground">{activeSession?.name ?? '—'}</span>
        </p>
      </div>

      {/* Student search */}
      <div className="space-y-1.5">
        <Label>Student <span className="text-destructive">*</span></Label>
        <StudentSearchCombobox
          sessionId={activeSession?.id}
          value={selectedStudent}
          onChange={setSelectedStudent}
          disabled={saving}
        />
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="flex items-center gap-2 pt-1">
        <Button type="submit" disabled={saving || !selectedStudent}>
          {saving ? 'Enrolling…' : 'Enroll Student'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </div>

    </form>
  )
}
