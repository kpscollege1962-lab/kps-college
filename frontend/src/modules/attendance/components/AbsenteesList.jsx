import { useEffect, useState } from 'react'
import { Printer } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { parseLocalDate } from '@/lib/dateUtils'
import RichText from '@/modules/homework/components/RichText'
import { classLabelText } from '@/modules/homework/utils/labels'
import { getStatusListReportService } from '../services/attendanceReports.service'
import { statusMeta } from '../utils/attendanceStatus'
import ParentContacts from './ParentContacts'
import '../styles/attendance-report-print.css'

const ORDER = { absent: 0, leave: 1, late: 2 }

// Every student not present on `date` across the campus (submitted registers only), with the
// reason and the parent / guardian numbers. Printable.
export default function AbsenteesList({ campusId, sessionId, date, reloadKey }) {
  const key = campusId && sessionId && date ? `${campusId}|${sessionId}|${date}|${reloadKey ?? ''}` : null
  const [state, setState] = useState({ key: null, rows: [], error: null })

  useEffect(() => {
    if (!key) return undefined
    let alive = true
    getStatusListReportService(campusId, { sessionId, dateFrom: date, dateTo: date, statuses: ['absent', 'late', 'leave'] })
      .then((result) => {
        if (!alive) return
        setState(result.success
          ? { key, rows: result.data.records ?? [], error: null }
          : { key, rows: [], error: result.message })
      })
    return () => { alive = false }
  }, [key, campusId, sessionId, date])

  if (state.key !== key) return <Skeleton className="h-48 w-full rounded-2xl" />
  if (state.error) return <Alert variant="destructive"><AlertDescription>{state.error}</AlertDescription></Alert>

  const rows = [...state.rows].sort((a, b) => (ORDER[a.status] ?? 9) - (ORDER[b.status] ?? 9))
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border py-14 text-center text-sm text-muted-foreground">
        No absent, late or on-leave students in the submitted attendance for this day.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <Button type="button" variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="mr-1.5 size-3.5" />Print
        </Button>
      </div>
      <div className="attendance-report-print-target space-y-2">
        <h2 className="hidden text-lg font-bold print:block">
          Absent students · {parseLocalDate(date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-3 py-2 font-medium">Class</th>
                <th className="px-3 py-2 font-medium">Student</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Reason</th>
                <th className="px-3 py-2 font-medium">Parent / guardian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => {
                const meta = statusMeta(r.status)
                return (
                  <tr key={r.recordId} className={cn(meta?.row)}>
                    <td className="whitespace-nowrap px-3 py-2 font-medium">
                      <RichText text={classLabelText(r.className, r.sectionName)} ordinal />
                    </td>
                    <td className="px-3 py-2">
                      <p className={cn('font-medium', r.status === 'absent' && 'text-red-700 dark:text-red-400')}>{r.studentName}</p>
                      <p className="font-mono text-[11px] text-muted-foreground">{r.grNo}</p>
                    </td>
                    <td className="px-3 py-2">
                      <span className={cn('rounded-md px-2 py-0.5 text-xs font-semibold', meta?.badge)}>{meta?.label}</span>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {r.remarks || <span className="italic text-muted-foreground">No reason given</span>}
                    </td>
                    <td className="px-3 py-2"><ParentContacts contacts={r.contacts} fatherName={r.fatherName} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
