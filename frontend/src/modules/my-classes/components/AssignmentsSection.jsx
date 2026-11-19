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

// ONE filter (Assigned Date, Due Date, Timetable wise filter) drives everything here:
//   View          shows the assignments for that filter;
//   Post          posts to the class + subject chosen in that filter, on those dates.
// Post is only there when the Assigned Date is today and the chosen class + subject has nothing
// assigned yet for today, so the Post form itself only asks for the classwork and homework text.
export default function AssignmentsSection({ campusId, sessionId, targets, timetableLoading }) {
  const [initial] = useState(() => {
    const today = toLocalDateString()
    return { assignedDate: today, dueDate: today, target: ALL } // due the same day by default
  })
  const [draft, setDraft] = useState(initial)     // what the filter inputs show (and what Post uses)
  const [applied, setApplied] = useState(initial) // what View has applied to the list

  const [showForm, setShowForm] = useState(false)
  const [formError, setFormError] = useState(null)
  const [existing, setExisting] = useState({ date: null, keys: new Set() })
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

  // Which class + subject already have classwork or homework for TODAY (whatever the due date).
  const today = toLocalDateString()
  const loadExisting = useCallback(async () => {
    if (!campusId || !sessionId) return
    const date = toLocalDateString()
    const result = await listMyAssignmentsService(campusId, { sessionId, assignedDate: date })
    setExisting({
      date,
      keys: new Set(
        result.success
          ? result.data.assignments.map((a) => `${a.class_group_id}-${a.section_id}-${a.subject_id}`)
          : []
      ),
    })
  }, [campusId, sessionId])

  useEffect(() => { loadExisting() }, [loadExisting])

  // ── What the filter allows ──────────────────────────────────────────────────
  const isToday = draft.assignedDate === today
  const selectedTarget = draft.target !== ALL ? targets.find((t) => t.key === draft.target) ?? null : null
  const existingReady = existing.date === today
  const alreadyAssigned = Boolean(selectedTarget && existingReady && existing.keys.has(selectedTarget.key))
  const noTargets = !timetableLoading && targets.length === 0

  // The Post button exists only for today, and not for a class + subject that already has work.
  const canOfferPost = isToday && existingReady && !alreadyAssigned && !noTargets

  // It is there but switched off until the filter says what to post.
  let blockedReason = null
  if (canOfferPost) {
    if (!selectedTarget) blockedReason = 'Select a class and subject in the filter to post an assignment.'
    else if (!draft.dueDate) blockedReason = 'Choose a due date to post an assignment.'
    else if (draft.dueDate < draft.assignedDate) blockedReason = 'The due date cannot be before the assigned date.'
  }

  // If the filter changes so that posting is no longer possible, the open form goes away.
  useEffect(() => {
    if (showForm && (!canOfferPost || blockedReason)) setShowForm(false)
  }, [showForm, canOfferPost, blockedReason])

  const togglePostForm = () => {
    setFormError(null)
    setShowForm((open) => !open)
  }

  const afterChange = () => {
    refresh()
    loadExisting()
  }

  const handleSave = async ({ classwork, homework }) => {
    setFormError(null)
    if (!selectedTarget) return setFormError('Select a class and subject in the filter first.')
    if (draft.assignedDate !== today) return setFormError('Assignments can only be posted for today.')
    if (!draft.dueDate || draft.dueDate < draft.assignedDate) {
      return setFormError('The due date cannot be before the assigned date.')
    }

    const result = await createBatch({
      assignedDate: draft.assignedDate,
      dueDate: draft.dueDate,
      classwork,
      homework,
      targets: [{
        classGroupId: selectedTarget.classGroupId,
        sectionId: selectedTarget.sectionId,
        subjectId: selectedTarget.subjectId,
      }],
    })
    if (!result.success) return setFormError(result.message)

    toast.success('Assignment posted')
    setShowForm(false)
    setApplied({ ...draft }) // show what was just posted
    loadExisting()
  }

  const filterText = (value) => {
    const target = targets.find((t) => t.key === value)
    return target ? targetText(target) : 'All classes and subjects'
  }

  // One short line saying why Post is not offered, so the missing button is not a mystery.
  let postNote = null
  if (!isToday) {
    postNote = 'Assignments can only be posted with today as the Assigned Date. Use View to look at other dates.'
  } else if (alreadyAssigned) {
    postNote = 'This class and subject already has an assignment for today. Use Edit on its box below to change it.'
  } else if (canOfferPost && blockedReason) {
    postNote = blockedReason
  } else if (canOfferPost) {
    postNote = nonWorkingReason(draft.dueDate) ? `The due date falls on ${nonWorkingReason(draft.dueDate)}.` : null
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
        {canOfferPost && (
          <Button
            type="button"
            className="ml-auto"
            onClick={togglePostForm}
            disabled={timetableLoading || Boolean(blockedReason)}
          >
            <Plus className="mr-1.5 size-3.5" />
            Post Assignment
          </Button>
        )}
      </div>

      {noTargets && (
        <p className="text-sm text-muted-foreground">
          You have no classes in the timetable yet, so there is nothing to assign.
        </p>
      )}
      {!noTargets && postNote && (
        <p className={`-mt-2 text-xs ${canOfferPost && !blockedReason ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`}>
          {postNote}
        </p>
      )}

      {showForm && selectedTarget && (
        <PostAssignmentForm
          classLabel={selectedTarget.classLabel}
          subjectName={selectedTarget.subjectName}
          assignedDate={draft.assignedDate}
          dueDate={draft.dueDate}
          saving={saving}
          error={formError}
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
          <p className="text-xs text-muted-foreground">Change the dates or the filter and press View.</p>
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