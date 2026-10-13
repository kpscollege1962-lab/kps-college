import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { useAbility } from '@casl/react'
import { AbilityContext } from '@/casl/AbilityProvider'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useSessionContext } from '@/shells/portal/hooks/useSessionContext'
import { toLocalDateString } from '@/lib/dateUtils'
import { useAssignmentsOverview } from '../hooks/useAssignmentsOverview'
import { useCampusList } from '../hooks/useCampusList'
import { buildGroups } from '../utils/groupAssignments'
import AssignmentGroupCard from '../components/AssignmentGroupCard'
import AssignmentsReportDialog from '../components/AssignmentsReportDialog'

const VIEWS = [
  { value: 'teacher', label: 'Teacher-wise' },
  { value: 'subject', label: 'Subject-wise' },
  { value: 'class',   label: 'Class-wise' },
]
const TYPES = [
  { value: 'all',       label: 'All' },
  { value: 'homework',  label: 'Homework' },
  { value: 'classwork', label: 'Classwork' },
]
const NOUN = { teacher: 'teachers', subject: 'subjects', class: 'classes' }

const shiftDate = (days) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return toLocalDateString(d)
}

function Segmented({ options, value, onChange }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg bg-muted p-1">
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

export default function AssignmentsPage() {
  const { campusId: campusParam } = useParams()
  const campusId = Number(campusParam)

  const ability = useAbility(AbilityContext)
  const canView = ability.can('read', 'HomeworkOverview')

  const { activeSession } = useSessionContext()
  const sessionId = activeSession?.id

  const { structure, assignments, truncated, loading, error, fetchStructure, fetchAssignments } =
    useAssignmentsOverview(campusId)
  const { campuses, fetchCampuses } = useCampusList()

  const [view, setView]             = useState('teacher')
  const [typeFilter, setTypeFilter] = useState('all')
  const [dueFrom, setDueFrom]       = useState(() => shiftDate(-7))
  const [dueTo, setDueTo]           = useState(() => shiftDate(14))
  const [openKeys, setOpenKeys]     = useState(() => new Set())
  const [reportGroup, setReportGroup] = useState(null)

  useEffect(() => {
    if (canView) fetchCampuses()
  }, [canView, fetchCampuses])

  useEffect(() => {
    if (canView && campusId && sessionId) fetchStructure(sessionId)
  }, [canView, campusId, sessionId, fetchStructure])

  useEffect(() => {
    if (canView && campusId && sessionId && dueFrom && dueTo && dueFrom <= dueTo) {
      fetchAssignments({ sessionId, dueFrom, dueTo })
    }
  }, [canView, campusId, sessionId, dueFrom, dueTo, fetchAssignments])

  // Start collapsed whenever the tab changes.
  useEffect(() => { setOpenKeys(new Set()) }, [view])

  const groups = useMemo(() => buildGroups(view, structure, assignments), [view, structure, assignments])

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

  const campusName = campuses.find((c) => c.id === campusId)?.name

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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/portal/assignments" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {campusName ? `${campusName} assignments` : 'Assignments'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading
              ? 'Loading…'
              : `${visibleTotal} assignment${visibleTotal !== 1 ? 's' : ''} · ${activeGroups} of ${groups.length} ${NOUN[view]} with work in this range`}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <Segmented options={VIEWS} value={view} onChange={setView} />

        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label htmlFor="due-from" className="text-xs text-muted-foreground">Due from</Label>
            <Input id="due-from" type="date" value={dueFrom} max={dueTo} onChange={(e) => setDueFrom(e.target.value)} className="w-40" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="due-to" className="text-xs text-muted-foreground">Due to</Label>
            <Input id="due-to" type="date" value={dueTo} min={dueFrom} onChange={(e) => setDueTo(e.target.value)} className="w-40" />
          </div>
          <Segmented options={TYPES} value={typeFilter} onChange={setTypeFilter} />
        </div>
      </div>

      {truncated && (
        <Alert>
          <AlertDescription>
            Showing the first 500 assignments in this range. Narrow the dates to see everything.
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
          <p className="text-sm font-medium text-foreground">Nothing to show yet</p>
          <p className="text-xs text-muted-foreground">No timetable or assignments found for this campus and session.</p>
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
              onReport={() => setReportGroup({ ...group, view })}            />
          ))}
        </div>
      )}

      <AssignmentsReportDialog
        open={!!reportGroup}
        onOpenChange={(open) => !open && setReportGroup(null)}
        group={reportGroup}
      />
    </div>
  )
}