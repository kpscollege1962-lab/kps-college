import { useState } from 'react'
import { toast } from 'sonner'
import { ArrowLeft, Printer, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { parseLocalDate } from '@/lib/dateUtils'
import RichText from '@/modules/homework/components/RichText'
import { classLabelText } from '@/modules/homework/utils/labels'
import { useClassRegister } from '../hooks/useClassRegister'
import { STATUSES, countMarks, statusMeta, timeOf } from '../utils/attendanceStatus'
import ParentContacts from './ParentContacts'
import '../styles/attendance-report-print.css'

const longDate = (d) =>
  parseLocalDate(d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

// Admin / principal view of one class's attendance on one date: every student, absent ones
// highlighted, the reason, and the parent / guardian numbers. Admins can reopen a submitted one.
export default function AdminClassRegister({ campusId, sectionId, date, onBack, onChanged }) {
  const { register, error, loading, saving, reopen } = useClassRegister(campusId, sectionId, date)
  const [confirmReopen, setConfirmReopen] = useState(false)

  const marks = Object.fromEntries((register?.records ?? []).map((r) => [r.studentId, r]))
  const students = register?.students ?? []
  const counts = countMarks(students, marks)
  const session = register?.session
  const title = register ? classLabelText(register.class.className, register.class.sectionName) : ''

  const doReopen = async () => {
    const result = await reopen(session.id)
    if (result.success) {
      setConfirmReopen(false)
      toast.success('Reopened: the form master can correct it and submit again')
      onChanged?.()
    } else {
      toast.error(result.message)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-1.5 size-4" />All classes
        </Button>
        <div className="ml-auto flex gap-2">
          {register?.canReopen && (
            <Button type="button" variant="outline" size="sm" onClick={() => setConfirmReopen(true)} disabled={saving}>
              <RotateCcw className="mr-1.5 size-3.5" />Reopen
            </Button>
          )}
          {register && session && (
            <Button type="button" variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="mr-1.5 size-3.5" />Print
            </Button>
          )}
        </div>
      </div>

      {loading && <Skeleton className="h-64 w-full rounded-2xl" />}
      {!loading && error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      {!loading && register && (
        <div className="attendance-report-print-target space-y-3">
          <div>
            <h2 className="text-xl font-bold"><RichText text={title} ordinal /></h2>
            <p className="text-sm text-muted-foreground">
              {longDate(register.date)}
              {register.formMasterNames.length > 0 && ` · Form master: ${register.formMasterNames.join(', ')}`}
            </p>
            <p className="mt-1 text-sm">
              {session?.status === 'submitted' ? (
                <span className="font-medium text-emerald-700 dark:text-emerald-400">
                  Submitted{session.submittedAt ? ` at ${timeOf(session.submittedAt)}` : ''}{session.markedByName ? ` by ${session.markedByName}` : ''}
                </span>
              ) : session ? (
                <span className="font-medium text-amber-700 dark:text-amber-400">
                  Not submitted yet: {students.length - counts.unmarked} of {students.length} marked so far
                  {session.markedByName ? ` (saved by ${session.markedByName})` : ''}
                </span>
              ) : (
                <span className="text-muted-foreground">Attendance has not been taken for this day.</span>
              )}
            </p>
          </div>

          {session && students.length > 0 && (
            <>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                {STATUSES.map((s) => (
                  <span key={s.value} className="flex items-center gap-1.5">
                    <span className={cn('rounded px-1.5 py-0.5 text-[11px] font-semibold', s.badge)}>{s.short}</span>
                    {s.label} <span className="font-semibold">{counts[s.value]}</span>
                  </span>
                ))}
                {counts.unmarked > 0 && <span className="text-muted-foreground">Not marked {counts.unmarked}</span>}
              </div>

              <div className="overflow-x-auto rounded-2xl border border-border bg-card">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs text-muted-foreground">
                      <th className="px-3 py-2 font-medium">No</th>
                      <th className="px-3 py-2 font-medium">Student</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                      <th className="px-3 py-2 font-medium">Reason</th>
                      <th className="px-3 py-2 font-medium">Parent / guardian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {students.map((s) => {
                      const mark = marks[s.studentId]
                      const meta = statusMeta(mark?.status)
                      const away = mark && mark.status !== 'present'
                      return (
                        <tr key={s.studentId} className={cn(meta?.row)}>
                          <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{s.classNo}</td>
                          <td className="px-3 py-2">
                            <p className={cn('font-medium', mark?.status === 'absent' && 'text-red-700 dark:text-red-400')}>{s.fullName}</p>
                            <p className="font-mono text-[11px] text-muted-foreground">{s.grNo}</p>
                          </td>
                          <td className="px-3 py-2">
                            <span className={cn('rounded-md px-2 py-0.5 text-xs font-semibold', meta?.badge ?? 'text-muted-foreground')}>
                              {meta?.label ?? 'Not marked'}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-xs">
                            {away ? (mark.remarks || <span className="italic text-muted-foreground">No reason given</span>) : ''}
                          </td>
                          <td className="px-3 py-2">
                            {away ? <ParentContacts contacts={s.contacts} fatherName={s.fatherName} /> : null}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      <AlertDialog open={confirmReopen} onOpenChange={(open) => !saving && setConfirmReopen(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reopen this attendance?</AlertDialogTitle>
            <AlertDialogDescription>
              It goes back to the form master as not submitted, so they can correct it and submit it again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={doReopen} disabled={saving}>{saving ? 'Reopening…' : 'Reopen'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
