import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import DeleteConfirmDialog from '@/modules/classes/components/DeleteConfirmDialog'
import { toLocalDateString } from '@/lib/dateUtils'
import { nonWorkingReason } from '@/lib/workingDays'
import { listMyAssignmentsService } from '../services/teacherWorkspace.service'
import { useMyAssignments } from '../hooks/useMyAssignments'
import { groupAssignmentBoxes } from '../utils/assignmentBoxes'
import PostAssignmentForm from './PostAssignmentForm'
import AssignmentBox from './AssignmentBox'
import EditAssignmentDialog from './EditAssignmentDialog'

const ALL = 'all'

const targetText = (t) => `${t.classLabel} ${t.subjectName}`

const defaultPostDates = () => {
  const today = toLocalDateString()
  return { assignedDate: today, dueDate: today }
}
// An empty date means "any". "All" in the timetable filter means every class and subject.
const filtersFor = (filters, targets) => {
  const params = {}
  if (filters.assignedDate) params.assignedDate = filters.assignedDate
  if (filters.dueDate) params.dueDate = filters.dueDate
  const target = filters.target !== ALL ? targets.find((t) => t.key === filters.target) : null
  if (target) {
    params.classGroupId = target.classGroupId
    params.sectionId = target.sectionId
    params.subjectId = target.subjectId
  }
  return params
}

// The view filter (dates, timetable filter, View), the Post Assignment form with its own dates,
// then the assignments given.
export default function AssignmentsSection({ campusId, sessionId, targets, timetableLoading }) {
  const [initial] = useState(() => ({ ...defaultPostDates(), target: ALL }))
  const [draft, setDraft] = useState(initial)     // what the view filter inputs show
  const [applied, setApplied] = useState(initial) // what View has applied to the list

  const [showForm, setShowForm] = useState(false)
  const [postDates, setPostDates] = useState(defaultPostDates) // the dates inside the Post form
  const [formError, setFormError] = useState(null)
  const [existingKeys, setExistingKeys] = useState(() => new Set())
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const {
    assignments, loading, error, saving, fetchAssignments, createBatch, saveBoxEdit, removeBox,
  } = useMyAssignments(campusId, sessionId)

  const boxes = useMemo(() => groupAssignmentBoxes(assignments), [assignments])

  // The list follows the filters that View applied.
  useEffect(() => {
    fetchAssignments(filtersFor(applied, targets))
  }, [applied, fetchAssignments]) // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = useCallback(
    () => fetchAssignments(filtersFor(applied, targets)),
    [applied, targets, fetchAssignments]
  )

  // Which class + subject already have something on the form's assigned date: not offered again.
  const loadExisting = useCallback(async (assignedDate) => {
    if (!campusId || !sessionId || !assignedDate) {
      setExistingKeys(new Set())
      return
    }
    const result = await listMyAssignmentsService(campusId, { sessionId, assignedDate })
    if (result.success) {
      setExistingKeys(
        new Set(result.data.assignments.map((a) => `${a.class_group_id}-${a.section_id}-${a.subject_id}`))
      )
    }
  }, [campusId, sessionId])

  useEffect(() => {
    if (showForm) loadExisting(postDates.assignedDate)
  }, [showForm, postDates.assignedDate, loadExisting])

  const availableTargets = useMemo(
    () => targets.filter((t) => !existingKeys.has(t.key)),
    [targets, existingKeys]
  )
  const hiddenCount = targets.length - availableTargets.length

  const togglePostForm = () => {
    setFormError(null)
    if (!showForm) setPostDates(defaultPostDates())
    setShowForm((open) => !open)
  }

  // The due date starts the same as the assigned date, so a new assigned date resets it to match.
  const handleAssignedDateChange = (value) =>
    setPostDates({ assignedDate: value, dueDate: value || postDates.dueDate })

  const afterChange = () => {
    refresh()
    if (showForm) loadExisting(postDates.assignedDate)
  }

  const handleSave = async ({ selected, classwork, homework }) => {
    setFormError(null)
    const today = toLocalDateString()
    const { assignedDate, dueDate } = postDates
    if (!assignedDate || !dueDate) return setFormError('Choose both the assigned date and the due date.')
    if (assignedDate > today) return setFormError('The assigned date cannot be in the future.')
    if (dueDate < today) return setFormError('The due date cannot be in the past.')
    if (dueDate < assignedDate) return setFormError('The due date cannot be before the assigned date.')

    const result = await createBatch({
      assignedDate,
      dueDate,
      classwork,
      homework,
      targets: selected.map((t) => ({
        classGroupId: t.classGroupId, sectionId: t.sectionId, subjectId: t.subjectId,
      })),
    })
    if (!result.success) return setFormError(result.message)

    toast.success(selected.length > 1 ? 'Assignments posted' : 'Assignment posted')
    setShowForm(false)
    // Show what was just posted.
    const next = { assignedDate, dueDate, target: ALL }
    setDraft(next)
    setApplied(next)
    loadExisting(assignedDate)
  }

  const noTargets = !timetableLoading && targets.length === 0
  const filterText = (value) => {
    const target = targets.find((t) => t.key === value)
    return target ? targetText(target) : 'All classes and subjects'
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Assignments</h2>

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="as-assigned">Assigned Date</Label>
          <Input
            id="as-assigned"
            type="date"
            value={draft.assignedDate}
            onChange={(e) => setDraft((d) => ({ ...d, assignedDate: e.target.value }))}
            className="w-44"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="as-due">Due Date</Label>
          <Input
            id="as-due"
            type="date"
            value={draft.dueDate}
            onChange={(e) => setDraft((d) => ({ ...d, dueDate: e.target.value }))}
            className="w-44"
          />
        </div>
        <div className="min-w-[14rem] max-w-sm flex-1 space-y-1.5">
          <Label>Timetable wise filter</Label>
          <Select value={draft.target} onValueChange={(v) => setDraft((d) => ({ ...d, target: v }))}>
            <SelectTrigger className="w-full">
              <SelectValue>{(value) => (value === ALL ? 'All classes and subjects' : filterText(value))}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All classes and subjects</SelectItem>
              {targets.map((t) => (
                <SelectItem key={t.key} value={t.key}>{targetText(t)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button type="button" variant="outline" onClick={() => setApplied({ ...draft })}>View</Button>
        <Button
          type="button"
          className="ml-auto"
          onClick={togglePostForm}
          disabled={timetableLoading || noTargets}
        >
          <Plus className="mr-1.5 size-3.5" />
          Post Assignment
        </Button>
      </div>

      {noTargets && (
        <p className="text-sm text-muted-foreground">
          You have no classes in the timetable yet, so there is nothing to assign.
        </p>
      )}

      {showForm && (
        <PostAssignmentForm
          assignedDate={postDates.assignedDate}
          dueDate={postDates.dueDate}
          maxAssignedDate={toLocalDateString()}
          minDueDate={toLocalDateString()}
          onAssignedDateChange={handleAssignedDateChange}
          onDueDateChange={(value) => setPostDates((d) => ({ ...d, dueDate: value }))}
          availableTargets={availableTargets}
          hiddenCount={hiddenCount}
          saving={saving}
          error={formError}
          dueReason={nonWorkingReason(postDates.dueDate)}
          onSubmit={handleSave}
          onCancel={() => setShowForm(false)}
        />
      )}

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      )}

      {!loading && error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      {!loading && !error && boxes.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-border py-14 text-center">
          <p className="text-sm font-medium text-foreground">No assignments for these filters</p>
          <p className="text-xs text-muted-foreground">Change the dates or the filter and press View, or post a new assignment.</p>
        </div>
      )}

      {!loading && !error && boxes.length > 0 && (
        <div className="space-y-3">
          {boxes.map((box) => (
            <AssignmentBox key={box.key} box={box} onEdit={setEditTarget} onDelete={setDeleteTarget} />
          ))}
        </div>
      )}

      <EditAssignmentDialog
        open={!!editTarget}
        onOpenChange={(open) => { if (!open) setEditTarget(null) }}
        box={editTarget}
        saving={saving}
        onSave={async (values) => {
          const result = await saveBoxEdit({ box: editTarget, ...values })
          if (result.success) {
            setEditTarget(null)
            toast.success('Assignment updated')
            afterChange()
          }
          return result
        }}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title="Delete assignment"
        description="The classwork and homework in this box will be permanently removed."
        onConfirm={async () => {
          setDeleting(true)
          const result = await removeBox(deleteTarget)
          setDeleting(false)
          if (result.success) {
            setDeleteTarget(null)
            afterChange()
          }
          return result
        }}
        deleting={deleting}
      />
    </section>
  )
}