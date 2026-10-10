import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { Plus, Paperclip, Pencil, Trash2, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useRoleContext } from '@/modules/auth/hooks/useRoleContext'
import { useSessionContext } from '@/shells/portal/hooks/useSessionContext'
import { useHomework } from '@/modules/homework/hooks/useHomework'
import { useMyTeachingClasses } from '../hooks/useMyTeachingClasses'
import HomeworkDialog from '@/modules/homework/components/HomeworkDialog'
import SubmissionsDialog from '@/modules/homework/components/SubmissionsDialog'
import DeleteConfirmDialog from '@/modules/classes/components/DeleteConfirmDialog'
import { parseLocalDate } from '@/lib/dateUtils'

const TYPE_TABS = [
  { value: 'homework', label: 'Homework' },
  { value: 'classwork', label: 'Classwork' },
]
const EMPTY_LABEL = { homework: 'No homework posted yet', classwork: 'No classwork posted yet' }

function AssignmentCard({ hw, onViewSubmissions, onEdit, onDelete }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-sm">{hw.subject?.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Due {parseLocalDate(hw.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <Button size="icon-sm" variant="ghost" onClick={() => onViewSubmissions(hw)}><Users className="size-3.5" /></Button>
          <Button size="icon-sm" variant="ghost" onClick={() => onEdit(hw)}><Pencil className="size-3.5" /></Button>
          <Button size="icon-sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => onDelete(hw)}><Trash2 className="size-3.5" /></Button>
        </div>
      </div>
      {hw.description && <p className="text-sm text-muted-foreground">{hw.description}</p>}
      {hw.attachment_url && (
        <a href={hw.attachment_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
          <Paperclip className="size-3" />{hw.attachment_original_name ?? 'Attachment'}
        </a>
      )}
    </div>
  )
}

export default function MyClassHomeworkPage() {
  const { classGroupId, sectionId } = useParams()
  const { activeRole } = useRoleContext()
  const { activeSession } = useSessionContext()
  const campusId = activeRole?.campusId
  const sessionId = activeSession?.id

  const { homework, loading, error, saving, deleting, fetchHomework, createHomework, updateHomework, deleteHomework } = useHomework(campusId)
  const { classes, fetchClasses } = useMyTeachingClasses(campusId)

  const [activeType, setActiveType]         = useState('homework')
  const [dialog, setDialog]                 = useState({ open: false, data: null })
  const [formError, setFormError]           = useState(null)
  const [deleteTarget, setDeleteTarget]     = useState(null)
  const [submissionsFor, setSubmissionsFor] = useState(null)

  const params = { sessionId, classGroupId: Number(classGroupId), sectionId: Number(sectionId), mine: true, limit: 100 }
  const currentClass = classes.find(
    (c) => String(c.classGroupId) === classGroupId && String(c.sectionId) === sectionId
  )
  const subjects = currentClass?.subjects ?? []

  useEffect(() => {
    if (campusId && sessionId) fetchHomework(params)
    if (campusId) fetchClasses()
  }, [campusId, sessionId, classGroupId, sectionId]) // eslint-disable-line react-hooks/exhaustive-deps

  const counts = {
    homework: homework.filter((h) => h.type === 'homework').length,
    classwork: homework.filter((h) => h.type === 'classwork').length,
  }
  const visible = homework.filter((hw) => hw.type === activeType)

  const openCreate = () => { setFormError(null); setDialog({ open: true, data: null }) }
  const openEdit = (hw) => { setFormError(null); setDialog({ open: true, data: hw }) }

  const handleSubmit = async (formData) => {
    if (!dialog.data) {
      formData.append('sessionId', sessionId)
      formData.append('classGroupId', classGroupId)
      formData.append('sectionId', sectionId)
    }
    const result = dialog.data
      ? await updateHomework(dialog.data.id, formData, params)
      : await createHomework(formData, params)
    if (result.success) {
      setActiveType(formData.get('type'))
      setDialog({ open: false, data: null })
    } else {
      setFormError(result.message)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 rounded-lg bg-muted p-1">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveType(tab.value)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm transition-colors',
                activeType === tab.value
                  ? 'bg-background text-foreground font-medium shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {tab.label}
              {!loading && <span className="ml-1.5 text-xs text-muted-foreground">{counts[tab.value]}</span>}
            </button>
          ))}
        </div>

        <Button size="sm" onClick={openCreate} disabled={saving}>
          <Plus className="size-3.5 mr-1.5" />
          Post Assignment
        </Button>
      </div>

      {loading && <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}</div>}
      {!loading && error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      {!loading && !error && visible.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 py-16 border border-dashed border-border rounded-2xl">
          <p className="text-sm font-medium text-foreground">{EMPTY_LABEL[activeType]}</p>
        </div>
      )}

      {!loading && !error && visible.length > 0 && (
        <div className="space-y-3">
          {visible.map((hw) => (
            <AssignmentCard key={hw.id} hw={hw} onViewSubmissions={setSubmissionsFor} onEdit={openEdit} onDelete={setDeleteTarget} />
          ))}
        </div>
      )}

      <HomeworkDialog
        open={dialog.open}
        onOpenChange={(open) => { if (!open) setDialog({ open: false, data: null }) }}
        subjects={subjects}
        initialData={dialog.data}
        onSubmit={handleSubmit}
        saving={saving}
        error={formError}
      />

      <SubmissionsDialog
        open={!!submissionsFor}
        onOpenChange={(open) => !open && setSubmissionsFor(null)}
        campusId={campusId}
        homework={submissionsFor}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Assignment"
        description={`This ${deleteTarget?.type ?? 'assignment'} and all student submissions will be permanently removed.`}
        onConfirm={async () => {
          const result = await deleteHomework(deleteTarget.id, params)
          if (result.success) setDeleteTarget(null)
          return result
        }}
        deleting={deleting}
      />
    </div>
  )
}