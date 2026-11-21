import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { useAbility } from '@casl/react'
import { AbilityContext } from '@/casl/AbilityProvider'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import ROLES from '@/constants/roles'
import { useRoleContext } from '@/modules/auth/hooks/useRoleContext'
import { useSessionContext } from '@/shells/portal/hooks/useSessionContext'
import { toLocalDateString } from '@/lib/dateUtils'
import { classLabelText } from '@/modules/homework/utils/labels'
import { assignedRangeParams, assignedRangeText, isReversedRange } from '@/modules/homework/utils/dateRange'
import DeleteConfirmDialog from '@/modules/classes/components/DeleteConfirmDialog'
import EditAssignmentDialog from '@/modules/my-classes/components/EditAssignmentDialog'
import { groupAssignmentBoxes } from '@/modules/my-classes/utils/assignmentBoxes'
import { useAssignmentsOverview } from '../hooks/useAssignmentsOverview'
import { useCampusList } from '../hooks/useCampusList'
import { useAdminAssignmentActions } from '../hooks/useAdminAssignmentActions'
import { useDeletedAssignments } from '../hooks/useDeletedAssignments'
import { buildGroups } from '../utils/groupAssignments'
import AssignmentGroupCard from '../components/AssignmentGroupCard'
import AdminReport from '../components/AdminReport'
import RecentlyDeletedList from '../components/RecentlyDeletedList'

const VIEWS = [
  { value: 'teacher', label: 'Teacher-wise' },
  { value: 'subject', label: 'Subject-wise' },
  { value: 'class',   label: 'Class-wise' },
]
const DELETED = 'deleted'
const TYPES = [
  { value: 'all',       label: 'All' },
  { value: 'homework',  label: 'Homework' },
  { value: 'classwork', label: 'Classwork' },
]
const NOUN = { teacher: 'teachers', subject: 'subjects', class: 'classes' }
const ALL = 'all'

// Everything the list shows lives in the URL, so refresh, browser Back and shared links work:
//   tab     teacher | subject | class | deleted
//   from    Assigned Date (range start). Missing = today; present but empty = open.
//   to      Due Date (range end on the ASSIGNED date). Missing = today; empty = open.
//   class / section / subject / teacher    optional filters (ids)
//   report  <view>:<group key>  -> that proforma is open inline
const FILTER_KEYS = ['class', 'section', 'subject', 'teacher']

const readFilters = (params, today) => ({
  assignedDate: params.has('from') ? params.get('from') : today,
  dueDate: params.has('to') ? params.get('to') : today,
  ...Object.fromEntries(FILTER_KEYS.map((k) => [k, params.get(k) || ALL])),
})

const uniqueBy = (items, keyOf) => [...new Map(items.map((i) => [keyOf(i), i])).values()]

function Segmented({ options, value, onChange }) {
  return (
    <div className="inline-flex flex-wrap items-center gap-1 rounded-lg bg-muted p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm transition-colors',
            value === o.value
              ? 'bg-background text-foreground font-medium shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function FilterSelect({ id, label, value, onChange, options, allLabel }) {
  const text = (v) => (v === ALL ? allLabel : options.find((o) => o.value === v)?.label ?? allLabel)
  return (
    <div className="w-44 space-y-1">
      <Label htmlFor={id} className="text-xs text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue>{(v) => text(v)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{allLabel}</SelectItem>
          {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  )
}

export default function AssignmentsPage() {
  const { campusId: campusParam } = useParams()
  const campusId = Number(campusParam)
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  const ability = useAbility(AbilityContext)
  const canView = ability.can('read', 'HomeworkOverview')
  const canEdit = ability.can('update', 'HomeworkOverview')
  const canDelete = ability.can('delete', 'HomeworkOverview')
  const canRestore = ability.can('restore', 'HomeworkOverview')

  const { activeRole } = useRoleContext()
  const roleName = activeRole?.roleName
  const { activeSession } = useSessionContext()
  const sessionId = activeSession?.id

  const { structure, formMasters, assignments, truncated, loading, error, fetchStructure, fetchAssignments } =
    useAssignmentsOverview(campusId)
  const { campuses, fetchCampuses } = useCampusList()
  const deleted = useDeletedAssignments(campusId)
  const actions = useAdminAssignmentActions(campusId)

  // ── State from the URL ──────────────────────────────────────────────────────
  const today = toLocalDateString()
  const tabParam = searchParams.get('tab')
  const tab = tabParam === DELETED && canRestore ? DELETED : VIEWS.some((v) => v.value === tabParam) ? tabParam : 'teacher'
  const view = tab === DELETED ? 'teacher' : tab
  const applied = useMemo(() => readFilters(searchParams, today), [searchParams, today])
  const appliedKey = JSON.stringify(applied)

  // The inputs (draft) follow the URL whenever it changes (View, browser Back, refresh).
  const [draft, setDraft] = useState(applied)
  const [draftFor, setDraftFor] = useState(appliedKey)
  if (draftFor !== appliedKey) {
    setDraftFor(appliedKey)
    setDraft(applied)
  }

  const [typeFilter, setTypeFilter] = useState('all')
  // Groups start collapsed whenever the tab changes.
  const [openKeys, setOpenKeys] = useState(() => new Set())
  const [openFor, setOpenFor] = useState(tab)
  if (openFor !== tab) {
    setOpenFor(tab)
    setOpenKeys(new Set())
  }
  const [editBox, setEditBox] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const updateParams = useCallback((changes, options) => {
    const next = new URLSearchParams(searchParams)
    for (const [k, v] of Object.entries(changes)) {
      if (v === undefined || v === null || v === ALL) next.delete(k)
      else next.set(k, v)
    }
    setSearchParams(next, options)
  }, [searchParams, setSearchParams])

  // ── Which campus: own campus for campus roles, the Working campus for Super Admin ──
  const fixedCampusId = roleName !== ROLES.SCHOOL_ADMIN ? activeRole?.campusId : null
  const wrongCampus = Boolean(fixedCampusId && fixedCampusId !== campusId)

  // ── Loading ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (canView) fetchCampuses()
  }, [canView, fetchCampuses])

  useEffect(() => {
    if (canView && campusId && sessionId && !wrongCampus) fetchStructure(sessionId)
  }, [canView, campusId, sessionId, wrongCampus, fetchStructure])

  const loadList = useCallback(() => {
    if (!canView || !campusId || !sessionId || wrongCampus || isReversedRange(applied)) return
    fetchAssignments({
      sessionId,
      ...assignedRangeParams(applied),
      ...(applied.class !== ALL && { classGroupId: applied.class }),
      ...(applied.section !== ALL && { sectionId: applied.section }),
      ...(applied.subject !== ALL && { subjectId: applied.subject }),
      ...(applied.teacher !== ALL && { staffId: applied.teacher }),
    })
  }, [canView, campusId, sessionId, wrongCampus, applied, fetchAssignments])

  useEffect(() => { loadList() }, [loadList])

  const { fetchDeleted } = deleted
  const loadDeleted = useCallback(() => {
    if (canRestore && sessionId && !wrongCampus) fetchDeleted(sessionId)
  }, [canRestore, sessionId, wrongCampus, fetchDeleted])

  useEffect(() => { if (tab === DELETED) loadDeleted() }, [tab, loadDeleted])

  // ── Filter options (from the timetable structure) ───────────────────────────
  const classOptions = useMemo(
    () => uniqueBy(structure, (t) => t.classGroupId)
      .sort((a, b) => (a.level ?? 0) - (b.level ?? 0))
      .map((t) => ({ value: String(t.classGroupId), label: classLabelText(t.className) })),
    [structure]
  )
  const sectionOptions = useMemo(
    () => uniqueBy(structure.filter((t) => draft.class === ALL || String(t.classGroupId) === draft.class), (t) => t.sectionId)
      .map((t) => ({ value: String(t.sectionId), label: draft.class === ALL ? classLabelText(t.className, t.sectionName) : t.sectionName }))
      .sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true })),
    [structure, draft.class]
  )
  const subjectOptions = useMemo(
    () => uniqueBy(structure, (t) => t.subjectId)
      .map((t) => ({ value: String(t.subjectId), label: t.subjectName }))
      .sort((a, b) => a.label.localeCompare(b.label)),
    [structure]
  )
  const teacherOptions = useMemo(
    () => uniqueBy(structure.filter((t) => t.staffId), (t) => t.staffId)
      .map((t) => ({ value: String(t.staffId), label: t.staffName ?? 'Unknown teacher' }))
      .sort((a, b) => a.label.localeCompare(b.label)),
    [structure]
  )

  // The structure rows that match the applied filters, so the groups follow the filters too.
  const filteredStructure = useMemo(() => structure.filter((t) =>
    (applied.class === ALL || String(t.classGroupId) === applied.class) &&
    (applied.section === ALL || String(t.sectionId) === applied.section) &&
    (applied.subject === ALL || String(t.subjectId) === applied.subject) &&
    (applied.teacher === ALL || String(t.staffId) === applied.teacher)
  ), [structure, applied])

  // Class-wise groups carry their form master(s) (Period 1 teacher), shown on the card and report.
  const formMasterOf = useMemo(() => {
    const byClass = new Map()
    for (const f of formMasters) {
      const key = `${f.classGroupId}-${f.sectionId}`
      byClass.set(key, [...(byClass.get(key) ?? []), f.staffName])
    }
    return byClass
  }, [formMasters])
  const withFormMasters = useCallback(
    (v, list) => (v === 'class' ? list.map((g) => ({ ...g, formMaster: formMasterOf.get(g.key)?.join(', ') ?? null })) : list),
    [formMasterOf]
  )

  const groups = useMemo(
    () => withFormMasters(view, buildGroups(view, filteredStructure, assignments)),
    [view, filteredStructure, assignments, withFormMasters]
  )
  const boxes = useMemo(() => groupAssignmentBoxes(assignments, { byTeacher: true }), [assignments])

  // ── Inline report from the URL ──────────────────────────────────────────────
  const reportParam = searchParams.get('report')
  const [reportView, reportKey] = reportParam ? reportParam.split(/:(.*)/s) : [null, null]
  const reportGroup = useMemo(() => {
    if (!reportParam || !NOUN[reportView]) return null
    return withFormMasters(reportView, buildGroups(reportView, filteredStructure, assignments))
      .find((g) => g.key === reportKey) ?? null
  }, [reportParam, reportView, reportKey, filteredStructure, assignments, withFormMasters])

  const openReport = (group) => updateParams({ report: `${view}:${group.key}` }, { state: { reportFromList: true } })
  const closeReport = () => {
    if (location.state?.reportFromList) return navigate(-1)
    updateParams({ report: null }, { replace: true })
  }

  // ── Guards ───────────────────────────────────────────────────────────────────
  if (!canView || !campusId) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-24 border border-dashed border-border rounded-2xl text-center">
        <p className="text-sm font-medium text-foreground">
          {canView ? 'Campus not found' : "You don't have access to this page"}
        </p>
        {canView && (
          <Link to="/portal/assignments" className="text-xs text-primary hover:underline">Back to campuses</Link>
        )}
      </div>
    )
  }
  if (wrongCampus) {
    return <Navigate to={`/portal/assignments/${fixedCampusId}${location.search}`} replace />
  }

  const campusName = campuses.find((c) => c.id === campusId)?.name
  const reversed = isReversedRange(draft)

  const rowsFor = (group) =>
    typeFilter === 'all' ? group.assignments : group.assignments.filter((a) => a.type === typeFilter)

  const visibleTotal = assignments.filter((a) => typeFilter === 'all' || a.type === typeFilter).length
  const activeGroups = groups.filter((g) => rowsFor(g).length > 0).length

  const toggle = (key) =>
    setOpenKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  const applyDraft = () => updateParams({
    from: draft.assignedDate ?? '',
    to: draft.dueDate ?? '',
    ...Object.fromEntries(FILTER_KEYS.map((k) => [k, draft[k]])),
  })

  const boxOf = (record) => boxes.find((b) =>
    [...b.records.classwork, ...b.records.homework].some((r) => r.id === record.id)
  ) ?? null

  const afterChange = () => {
    loadList()
    if (canRestore) loadDeleted()
  }

  // ── Report open: it replaces the list ───────────────────────────────────────
  if (reportParam) {
    if (reportGroup) {
      return <AdminReport key={reportParam} campusId={campusId} group={reportGroup} view={reportView} onBack={closeReport} />
    }
    if (loading || !sessionId) {
      return <Skeleton className="h-96 w-full rounded-2xl" />
    }
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">That report is not available for the current filters.</p>
        <Button type="button" variant="outline" size="sm" onClick={closeReport}>
          <ArrowLeft className="mr-1.5 size-3.5" />
          Back
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {roleName === ROLES.SCHOOL_ADMIN || !fixedCampusId ? (
            <Link to="/portal/assignments" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-4" />
            </Link>
          ) : null}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {campusName ? `${campusName} assignments` : 'Assignments'}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {tab === DELETED
                ? 'Deleted assignments of this campus and session'
                : loading
                  ? 'Loading…'
                  : `${visibleTotal} assignment${visibleTotal !== 1 ? 's' : ''} given ${assignedRangeText(applied)} · ${activeGroups} of ${groups.length} ${NOUN[view]} with work`}
            </p>
          </div>
        </div>

        {roleName === ROLES.SCHOOL_ADMIN && campuses.length > 1 && (
          <div className="w-52">
            <Select value={String(campusId)} onValueChange={(v) => navigate(`/portal/assignments/${v}${location.search}`)}>
              <SelectTrigger className="w-full" aria-label="Campus">
                <SelectValue>{(v) => campuses.find((c) => String(c.id) === v)?.name ?? 'Campus'}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {campuses.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          options={canRestore ? [...VIEWS, { value: DELETED, label: 'Recently deleted' }] : VIEWS}
          value={tab}
          onChange={(v) => updateParams({ tab: v === 'teacher' ? null : v })}
        />
        {tab !== DELETED && <Segmented options={TYPES} value={typeFilter} onChange={setTypeFilter} />}
      </div>

      {tab === DELETED ? (
        <RecentlyDeletedList
          rows={deleted.rows}
          loading={deleted.loading}
          error={deleted.error}
          saving={actions.saving}
          onRestore={async (row) => {
            const result = await actions.restore(row)
            if (result.success) afterChange()
            return result
          }}
          onPurge={async (row) => {
            const result = await actions.purge(row)
            if (result.success) loadDeleted()
            return result
          }}
        />
      ) : (
        <>
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <Label htmlFor="as-assigned" className="text-xs text-muted-foreground">Assigned Date</Label>
              <Input id="as-assigned" type="date" value={draft.assignedDate ?? ''} className="w-40"
                onChange={(e) => setDraft((d) => ({ ...d, assignedDate: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="as-due" className="text-xs text-muted-foreground">Due Date</Label>
              <Input id="as-due" type="date" value={draft.dueDate ?? ''} className="w-40"
                onChange={(e) => setDraft((d) => ({ ...d, dueDate: e.target.value }))} />
            </div>
            <FilterSelect id="f-class" label="Class" allLabel="All classes" value={draft.class} options={classOptions}
              onChange={(v) => setDraft((d) => ({ ...d, class: v, section: ALL }))} />
            <FilterSelect id="f-section" label="Section" allLabel="All sections" value={draft.section} options={sectionOptions}
              onChange={(v) => setDraft((d) => ({ ...d, section: v }))} />
            <FilterSelect id="f-subject" label="Subject" allLabel="All subjects" value={draft.subject} options={subjectOptions}
              onChange={(v) => setDraft((d) => ({ ...d, subject: v }))} />
            <FilterSelect id="f-teacher" label="Teacher" allLabel="All teachers" value={draft.teacher} options={teacherOptions}
              onChange={(v) => setDraft((d) => ({ ...d, teacher: v }))} />
            <Button type="button" variant="outline" onClick={applyDraft}>View</Button>
          </div>
          <p className={cn('-mt-1 text-xs', reversed ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground')}>
            {reversed
              ? 'The Due Date is before the Assigned Date, so nothing matches.'
              : 'Shows the work ASSIGNED between the two dates (inclusive). Leave a date empty to leave that end open.'}
          </p>

          {truncated && (
            <Alert>
              <AlertDescription>
                Showing the first 500 assignments in this range. Narrow the dates or filters to see everything.
              </AlertDescription>
            </Alert>
          )}

          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

          {loading && (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-2xl" />)}
            </div>
          )}

          {!loading && !error && groups.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-16 border border-dashed border-border rounded-2xl">
              <p className="text-sm font-medium text-foreground">Nothing to show</p>
              <p className="text-xs text-muted-foreground">No timetable or assignments match these filters for this campus and session.</p>
            </div>
          )}

          {!loading && !error && groups.length > 0 && (
            <div className="space-y-3">
              {groups.map((group) => (
                <AssignmentGroupCard
                  key={group.key}
                  group={group}
                  rows={rowsFor(group)}
                  view={view}
                  open={openKeys.has(group.key)}
                  onToggle={() => toggle(group.key)}
                  onReport={() => openReport(group)}
                  onEdit={canEdit ? (record) => setEditBox(boxOf(record)) : undefined}
                  onDelete={canDelete ? setDeleteTarget : undefined}
                />
              ))}
            </div>
          )}
        </>
      )}

      <EditAssignmentDialog
        admin
        open={!!editBox}
        onOpenChange={(open) => { if (!open) setEditBox(null) }}
        box={editBox}
        saving={actions.saving}
        onSave={async (values) => {
          const result = await actions.saveBox({ box: editBox, ...values })
          if (result.success) {
            setEditBox(null)
            toast.success('Assignment updated')
          }
          afterChange()
          return result
        }}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title="Delete assignment"
        description="It disappears from every list and proforma, for teachers too. You can restore it from Recently deleted."
        onConfirm={async () => {
          const result = await actions.deleteOne(deleteTarget)
          if (result.success) {
            toast.success('Assignment deleted')
            afterChange()
          }
          return result
        }}
        deleting={actions.saving}
      />
    </div>
  )
}
