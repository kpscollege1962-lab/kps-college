import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { CheckCheck, ChevronLeft, ChevronRight, Lock, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { formatDate, parseLocalDate, toLocalDateString } from '@/lib/dateUtils'
import { nonWorkingReason } from '@/lib/workingDays'
import { useClassRegister } from '../hooks/useClassRegister'
import { QUICK_REASONS, STATUSES, countMarks, statusMeta, timeOf } from '../utils/attendanceStatus'

const marksFrom = (register) => {
  const marks = {}
  for (const r of register?.records ?? []) marks[r.studentId] = { status: r.status, remarks: r.remarks ?? '' }
  return marks
}

const longDate = (d) =>
  parseLocalDate(d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })

// The form master's register for one class (class page → Attendance tab). Today is marked and
// submitted here; other days are shown read-only (a past draft the office reopened can be finished).
// The date is in the URL (?date=, missing = today).
export default function RegisterEditor({ campusId, sectionId }) {
  const [params, setParams] = useSearchParams()
  const today = toLocalDateString()
  const rawDate = params.get('date')
  const date = rawDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : today

  const { register, error, loading, saving, save } = useClassRegister(campusId, sectionId, date)

  // Local marks follow the server copy whenever a new one arrives (other day, after save).
  const loadKey = register ? `${register.date}|${register.session?.updatedAt ?? ''}|${register.session?.status ?? ''}` : null
  const [marks, setMarks] = useState({})
  const [dirty, setDirty] = useState(false)
  const [marksFor, setMarksFor] = useState(null)
  if (loadKey && marksFor !== loadKey) {
    setMarksFor(loadKey)
    setMarks(marksFrom(register))
    setDirty(false)
  }
  const [confirmOpen, setConfirmOpen] = useState(false)

  const goTo = (d) => {
    if (d === date) return
    if (dirty && !window.confirm('Your marks are not saved. Leave this day without saving?')) return
    const next = new URLSearchParams(params)
    if (d === today) next.delete('date')
    else next.set('date', d)
    setParams(next, { replace: true })
  }
  const shift = (days) => {
    const d = parseLocalDate(date)
    d.setDate(d.getDate() + days)
    goTo(toLocalDateString(d))
  }

  const students = register?.students ?? []
  const editable = Boolean(register?.editable)
  const counts = countMarks(students, marks)
  const markedCount = students.length - counts.unmarked

  const setStatus = (studentId, status) => {
    setMarks((m) => ({
      ...m,
      [studentId]: { status, remarks: status === 'present' ? '' : (m[studentId]?.remarks ?? '') },
    }))
    setDirty(true)
  }
  const setReason = (studentId, remarks) => {
    setMarks((m) => ({ ...m, [studentId]: { ...m[studentId], remarks } }))
    setDirty(true)
  }
  const markRestPresent = () => {
    setMarks((m) => {
      const next = { ...m }
      for (const s of students) if (!next[s.studentId]?.status) next[s.studentId] = { status: 'present', remarks: '' }
      return next
    })
    setDirty(true)
  }

  const payload = () => students
    .filter((s) => marks[s.studentId]?.status)
    .map((s) => ({
      studentId: s.studentId,
      status: marks[s.studentId].status,
      remarks: marks[s.studentId].remarks?.trim() || null,
    }))

  const saveDraft = async () => {
    const result = await save({ records: payload() })
    if (result.success) toast.success('Attendance saved (not submitted yet)')
    else toast.error(result.message)
  }
  const submit = async () => {
    const result = await save({ records: payload(), submit: true })
    if (result.success) {
      setConfirmOpen(false)
      toast.success('Attendance submitted: it is now with the office')
    } else {
      toast.error(result.message)
    }
  }

  const holiday = nonWorkingReason(date)
  const notPresent = students.filter((s) => marks[s.studentId]?.status && marks[s.studentId].status !== 'present')

  return (
    <div className="space-y-3">
      {/* Day and status */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          <Button type="button" variant="outline" size="icon-sm" onClick={() => shift(-1)} aria-label="Previous day">
            <ChevronLeft className="size-4" />
          </Button>
          <Input
            type="date"
            value={date}
            max={today}
            onChange={(e) => e.target.value && goTo(e.target.value)}
            className="h-8 w-40"
            aria-label="Attendance date"
          />
          <Button type="button" variant="outline" size="icon-sm" onClick={() => shift(1)} disabled={date >= today} aria-label="Next day">
            <ChevronRight className="size-4" />
          </Button>
          {date !== today && (
            <Button type="button" variant="ghost" size="sm" onClick={() => goTo(today)}>Today</Button>
          )}
        </div>
        <span className="text-sm font-medium">{longDate(date)}</span>
        {register && <StatusChip register={register} />}
      </div>
      {holiday && <p className="text-xs text-amber-600">This day falls on {holiday}.</p>}

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
        </div>
      )}
      {!loading && error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      {!loading && register && (
        <>
          {register.session?.status === 'submitted' && (
            <div className="flex items-start gap-2 rounded-xl border border-emerald-600/30 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
              <Lock className="mt-0.5 size-4 shrink-0" />
              <span>
                Submitted{register.session.submittedAt ? ` at ${timeOf(register.session.submittedAt)}` : ''}
                {register.session.markedByName ? ` by ${register.session.markedByName}` : ''} and sent to the office.
                Only the office can reopen it.
              </span>
            </div>
          )}

          {!register.session && !editable ? (
            <div className="rounded-2xl border border-dashed border-border py-14 text-center text-sm text-muted-foreground">
              {register.lockedReason === 'future'
                ? 'Attendance cannot be taken for a future date.'
                : register.lockedReason === 'past'
                  ? 'No attendance was taken on this day.'
                  : register.lockedMessage}
            </div>
          ) : students.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-14 text-center text-sm text-muted-foreground">
              No students are enrolled in this class.
            </div>
          ) : (
            <>
              {!editable && register.session?.status !== 'submitted' && register.lockedMessage && (
                <p className="text-xs text-muted-foreground">{register.lockedMessage}</p>
              )}

              {/* Counts + quick action */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-border bg-card px-3 py-2 text-sm">
                {STATUSES.map((s) => (
                  <span key={s.value} className="flex items-center gap-1.5">
                    <span className={cn('rounded px-1.5 py-0.5 text-[11px] font-semibold', s.badge)}>{s.short}</span>
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-semibold">{counts[s.value]}</span>
                  </span>
                ))}
                {editable && counts.unmarked > 0 && (
                  <span className="text-muted-foreground">· <span className="font-semibold text-foreground">{counts.unmarked}</span> not marked</span>
                )}
                {editable && counts.unmarked > 0 && (
                  <Button type="button" size="sm" variant="outline" className="ml-auto" onClick={markRestPresent}>
                    <CheckCheck className="mr-1.5 size-3.5" />
                    {markedCount === 0 ? 'Mark all present' : 'Mark the rest present'}
                  </Button>
                )}
              </div>

              {/* Students */}
              <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
                {students.map((s) => {
                  const mark = marks[s.studentId] ?? { status: null, remarks: '' }
                  const meta = statusMeta(mark.status)
                  return (
                    <li key={s.studentId} className={cn('px-3 py-2.5 sm:px-4', meta?.row)}>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                        <span className="w-7 shrink-0 text-center font-mono text-xs text-muted-foreground">{s.classNo}</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{s.fullName}</p>
                          <p className="font-mono text-[11px] text-muted-foreground">{s.grNo}</p>
                        </div>
                        {editable ? (
                          <div className="flex gap-1" role="radiogroup" aria-label={`Attendance of ${s.fullName}`}>
                            {STATUSES.map((st) => (
                              <button
                                key={st.value}
                                type="button"
                                role="radio"
                                aria-checked={mark.status === st.value}
                                onClick={() => setStatus(s.studentId, st.value)}
                                disabled={saving}
                                className={cn(
                                  'h-8 min-w-9 rounded-md border px-2 text-xs font-semibold transition-colors',
                                  mark.status === st.value ? st.active : 'border-border bg-background text-muted-foreground hover:bg-muted',
                                )}
                              >
                                <span className="sm:hidden">{st.short}</span>
                                <span className="hidden sm:inline">{st.label}</span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span className={cn('rounded-md px-2 py-0.5 text-xs font-semibold', meta?.badge ?? 'text-muted-foreground')}>
                            {meta?.label ?? 'Not marked'}
                          </span>
                        )}
                      </div>

                      {mark.status && mark.status !== 'present' && (
                        editable ? (
                          <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:pl-10">
                            <span className="text-[11px] text-muted-foreground">Reason:</span>
                            {QUICK_REASONS[mark.status].map((r) => (
                              <button
                                key={r}
                                type="button"
                                onClick={() => setReason(s.studentId, mark.remarks === r ? '' : r)}
                                disabled={saving}
                                className={cn(
                                  'rounded-full border px-2 py-0.5 text-[11px]',
                                  mark.remarks === r ? 'border-foreground bg-foreground text-background' : 'border-border bg-background hover:bg-muted',
                                )}
                              >
                                {r}
                              </button>
                            ))}
                            <Input
                              value={mark.remarks}
                              onChange={(e) => setReason(s.studentId, e.target.value)}
                              placeholder="Or write a reason (optional)"
                              maxLength={255}
                              disabled={saving}
                              className="h-7 w-full bg-background text-xs sm:w-60"
                            />
                          </div>
                        ) : (
                          <p className="mt-1 text-xs text-muted-foreground sm:pl-10">
                            Reason: {mark.remarks || <span className="italic">none given</span>}
                          </p>
                        )
                      )}
                    </li>
                  )
                })}
              </ul>

              {/* Save / submit */}
              {editable && (
                <div className="sticky bottom-0 z-10 flex flex-wrap items-center gap-2 border-t border-border bg-background/95 py-3 backdrop-blur">
                  <p className="mr-auto text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{markedCount}</span> of {students.length} marked
                    {dirty && <span className="text-amber-600"> · not saved</span>}
                  </p>
                  <Button type="button" variant="outline" size="sm" onClick={saveDraft} disabled={saving || !dirty || markedCount === 0}>
                    {saving ? 'Saving…' : 'Save'}
                  </Button>
                  <Button
                    type="button" size="sm"
                    onClick={() => setConfirmOpen(true)}
                    disabled={saving || counts.unmarked > 0 || !register.canSubmit}
                    title={counts.unmarked > 0 ? 'Mark every student first' : undefined}
                  >
                    <Send className="mr-1.5 size-3.5" />Submit attendance
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}

      <AlertDialog open={confirmOpen} onOpenChange={(open) => !saving && setConfirmOpen(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit attendance for {formatDate(date)}?</AlertDialogTitle>
            <AlertDialogDescription>
              {counts.present} present · {counts.absent} absent · {counts.late} late · {counts.leave} on leave.
              It goes to the office and is locked; only the office can reopen it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {notPresent.length > 0 && (
            <ul className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-border p-2 text-sm">
              {notPresent.map((s) => {
                const mark = marks[s.studentId]
                const meta = statusMeta(mark.status)
                return (
                  <li key={s.studentId} className="flex items-baseline gap-2">
                    <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold', meta.badge)}>{meta.label}</span>
                    <span className="font-medium">{s.fullName}</span>
                    <span className="truncate text-xs text-muted-foreground">{mark.remarks || 'no reason'}</span>
                  </li>
                )
              })}
            </ul>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); submit() }} disabled={saving}>
              {saving ? 'Submitting…' : 'Submit'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function StatusChip({ register }) {
  const { session } = register
  if (session?.status === 'submitted') {
    return <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Submitted</span>
  }
  if (session) {
    return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">Saved, not submitted</span>
  }
  if (register.editable) {
    return <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">Not taken yet</span>
  }
  return null
}
