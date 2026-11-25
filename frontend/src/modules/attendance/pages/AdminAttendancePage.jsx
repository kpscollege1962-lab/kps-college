import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { ChevronLeft, ChevronRight, FileBarChart, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import ROLES from '@/constants/roles'
import { parseLocalDate, toLocalDateString } from '@/lib/dateUtils'
import { nonWorkingReason } from '@/lib/workingDays'
import { useRoleContext } from '@/modules/auth/hooks/useRoleContext'
import { useSessionContext } from '@/shells/portal/hooks/useSessionContext'
import { useCampusList } from '@/modules/assignments/hooks/useCampusList'
import RichText from '@/modules/homework/components/RichText'
import { classLabelText } from '@/modules/homework/utils/labels'
import { useAttendanceSections } from '../hooks/useAttendanceSections'
import { timeOf } from '../utils/attendanceStatus'
import AdminClassRegister from '../components/AdminClassRegister'
import AbsenteesList from '../components/AbsenteesList'

const ZERO = { present: 0, absent: 0, late: 0, leave: 0 }
const isDay = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)

// The office's daily attendance: which classes submitted, the day's totals, each class's register
// (absent students highlighted, reason, parent numbers) and the list of absent students.
// State in the URL: date (missing = today), campus (School Admin / no Working campus), tab, class.
export default function AdminAttendancePage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const { activeRole } = useRoleContext()
  const { activeSession } = useSessionContext()
  const sessionId = activeSession?.id
  const today = toLocalDateString()
  const date = isDay(params.get('date')) ? params.get('date') : today
  const tab = params.get('tab') === 'absentees' ? 'absentees' : 'classes'
  const openSection = Number(params.get('class')) || null

  // Campus: campus roles and Super Admin's Working campus are fixed; otherwise pick one.
  const fixedCampusId = activeRole?.roleName !== ROLES.SCHOOL_ADMIN ? activeRole?.campusId ?? null : null
  const { campuses, fetchCampuses } = useCampusList()
  useEffect(() => { if (!fixedCampusId) fetchCampuses() }, [fixedCampusId, fetchCampuses])
  const campusId = fixedCampusId ?? (Number(params.get('campus')) || campuses[0]?.id || null)

  const { sections, loading, error, fetchMySections } = useAttendanceSections(campusId)
  const refresh = () => { if (campusId && sessionId) fetchMySections(sessionId, date) }
  useEffect(() => {
    if (campusId && sessionId) fetchMySections(sessionId, date)
  }, [campusId, sessionId, date, fetchMySections])

  const update = (changes, replace = false) => {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(changes)) {
      if (v == null || v === '') next.delete(k)
      else next.set(k, String(v))
    }
    setParams(next, { replace })
  }
  const goTo = (d) => update({ date: d === today ? null : d }, true)
  const shift = (days) => {
    const d = parseLocalDate(date)
    d.setDate(d.getDate() + days)
    goTo(toLocalDateString(d))
  }

  const submitted = sections.filter((s) => s.registerStatus === 'submitted')
  const pending = sections.filter((s) => s.registerStatus !== 'submitted')
  const totals = submitted.reduce((t, s) => ({
    present: t.present + (s.breakdown?.present ?? 0),
    absent: t.absent + (s.breakdown?.absent ?? 0),
    late: t.late + (s.breakdown?.late ?? 0),
    leave: t.leave + (s.breakdown?.leave ?? 0),
  }), ZERO)
  const holiday = nonWorkingReason(date)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Attendance</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Taken and submitted by each class&apos;s form master</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!fixedCampusId && campuses.length > 0 && (
            <Select value={campusId ? String(campusId) : ''} onValueChange={(v) => update({ campus: v, class: null })}>
              <SelectTrigger className="h-8 w-44">
                <SelectValue>{(v) => campuses.find((c) => String(c.id) === v)?.name ?? 'Campus'}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {campuses.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          <div className="flex items-center gap-1">
            <Button type="button" variant="outline" size="icon-sm" onClick={() => shift(-1)} aria-label="Previous day">
              <ChevronLeft className="size-4" />
            </Button>
            <Input
              type="date" value={date} max={today}
              onChange={(e) => e.target.value && goTo(e.target.value)}
              className="h-8 w-40" aria-label="Date"
            />
            <Button type="button" variant="outline" size="icon-sm" onClick={() => shift(1)} disabled={date >= today} aria-label="Next day">
              <ChevronRight className="size-4" />
            </Button>
            {date !== today && <Button type="button" variant="ghost" size="sm" onClick={() => goTo(today)}>Today</Button>}
          </div>
          <Button type="button" variant="outline" size="sm" onClick={refresh} disabled={loading}>
            <RefreshCw className={cn('mr-1.5 size-3.5', loading && 'animate-spin')} />Refresh
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => navigate('/portal/attendance/reports')}>
            <FileBarChart className="mr-1.5 size-3.5" />Reports
          </Button>
        </div>
      </div>
      {holiday && <p className="-mt-3 text-xs text-amber-600">This day falls on {holiday}.</p>}

      {!campusId ? (
        <p className="text-sm text-muted-foreground">Choose a campus.</p>
      ) : openSection ? (
        <AdminClassRegister
          key={`${campusId}-${openSection}-${date}`}
          campusId={campusId}
          sectionId={openSection}
          date={date}
          onBack={() => update({ class: null })}
          onChanged={refresh}
        />
      ) : (
        <>
          {/* Day summary */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            <Stat label="Classes submitted" value={`${submitted.length} / ${sections.length}`} />
            <Stat label="Absent" value={totals.absent} tone={totals.absent ? 'red' : null} />
            <Stat label="Late" value={totals.late} tone={totals.late ? 'amber' : null} />
            <Stat label="On leave" value={totals.leave} tone={totals.leave ? 'blue' : null} />
            <Stat label="Present" value={totals.present} />
            <Stat label="Not submitted" value={pending.length} tone={pending.length ? 'amber' : null} />
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-border">
            {[
              { value: 'classes', label: 'Classes' },
              { value: 'absentees', label: `Absent students (${totals.absent + totals.late + totals.leave})` },
            ].map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => update({ tab: t.value === 'classes' ? null : t.value })}
                className={cn(
                  '-mb-px border-b-2 px-3 py-2 text-sm',
                  tab === t.value ? 'border-primary font-medium text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'absentees' ? (
            <AbsenteesList
              campusId={campusId}
              sessionId={sessionId}
              date={date}
              reloadKey={submitted.map((s) => `${s.sectionId}:${s.submittedAt}`).join(',')}
            />
          ) : loading && sections.length === 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
            </div>
          ) : error ? (
            <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
          ) : sections.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-14 text-center text-sm text-muted-foreground">
              No classes in this session.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {sections.map((s) => <ClassCard key={s.sectionId} section={s} onOpen={() => update({ class: s.sectionId })} />)}
            </div>
          )}
        </>
      )}
    </div>
  )
}

const TONES = {
  red: 'text-red-600 dark:text-red-400',
  amber: 'text-amber-600 dark:text-amber-400',
  blue: 'text-blue-600 dark:text-blue-400',
}

function Stat({ label, value, tone }) {
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={cn('text-xl font-bold', tone && TONES[tone])}>{value}</p>
    </div>
  )
}

function ClassCard({ section, onOpen }) {
  const b = section.breakdown ?? ZERO
  const status = section.registerStatus
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/50 hover:bg-accent/30"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-base font-semibold">
          <RichText text={classLabelText(section.className, section.sectionName)} ordinal />
        </span>
        {status === 'submitted' ? (
          <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            Submitted {timeOf(section.submittedAt)}
          </span>
        ) : status === 'draft' ? (
          <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            In progress
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">Not taken</span>
        )}
      </div>
      <p className="truncate text-xs text-muted-foreground">
        Form master: {section.formMasterNames?.length ? section.formMasterNames.join(', ') : 'none (no Period 1 teacher)'}
      </p>
      {status === 'submitted' ? (
        <p className="text-sm">
          <span className="font-semibold text-emerald-700 dark:text-emerald-400">{b.present}</span> present ·{' '}
          <span className={cn('font-semibold', b.absent && 'text-red-600 dark:text-red-400')}>{b.absent}</span> absent ·{' '}
          <span className="font-semibold">{b.late}</span> late · <span className="font-semibold">{b.leave}</span> leave
        </p>
      ) : status === 'draft' ? (
        <p className="text-sm text-muted-foreground">{section.recordCount ?? 0} of {section.enrolledCount} marked, not submitted</p>
      ) : (
        <p className="text-sm text-muted-foreground">{section.enrolledCount} students</p>
      )}
    </button>
  )
}
