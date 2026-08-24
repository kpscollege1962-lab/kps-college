import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DatePicker } from '@/components/ui/date-picker'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { useSessionContext } from '@/shells/portal/hooks/useSessionContext'
import { useRoleContext } from '@/modules/auth/hooks/useRoleContext'
import { useClassRegisterReport } from '../hooks/useClassRegisterReport'
import '../styles/attendance-report-print.css'

const STATUS_CODE = {
  present: 'P',
  absent: 'A',
  late: 'L',
  leave: 'Lv',
}

export default function ClassRegisterReportPage() {
  const { activeSession } = useSessionContext()
  const { activeRole } = useRoleContext()
  const campusId = activeRole?.campusId

  const {
    sections, sectionsLoading, report, generated, loading, error, fetchSections, generateReport, monthGroups,
  } = useClassRegisterReport(campusId)

  const today = format(new Date(), 'yyyy-MM-dd')
  const [sectionId, setSectionId] = useState('')
  const [dateFrom, setDateFrom] = useState(today)
  const [dateTo, setDateTo] = useState(today)

  useEffect(() => {
    if (activeSession?.id) fetchSections(activeSession.id)
  }, [activeSession?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleGenerate = () => {
    if (!activeSession?.id || !sectionId || !dateFrom || !dateTo) return
    generateReport({ sessionId: activeSession.id, sectionId, dateFrom, dateTo })
  }

  const canGenerate = Boolean(activeSession?.id && sectionId && dateFrom && dateTo)
  const selectedSection = sections.find((s) => String(s.sectionId) === sectionId)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4 print:hidden">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Section</p>
          <Select value={sectionId} onValueChange={setSectionId} disabled={sectionsLoading || sections.length === 0}>
            <SelectTrigger className="w-48">
              <span>
                {sectionsLoading
                  ? 'Loading…'
                  : selectedSection
                    ? `${selectedSection.className}${selectedSection.sectionName ? ` — ${selectedSection.sectionName}` : ''}`
                    : 'Select a section'}
              </span>
            </SelectTrigger>
            <SelectContent>
              {sections.map((s) => (
                <SelectItem key={s.sectionId} value={String(s.sectionId)}>
                  {s.className}{s.sectionName ? ` — ${s.sectionName}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">From</p>
          <DatePicker value={dateFrom} onChange={setDateFrom} className="w-40" />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">To</p>
          <DatePicker value={dateTo} onChange={setDateTo} className="w-40" />
        </div>
        <Button onClick={handleGenerate} disabled={!canGenerate || loading}>
          {loading ? 'Generating…' : 'Generate Report'}
        </Button>
        {generated && report && report.dates.length > 0 && (
          <Button variant="outline" onClick={() => window.print()} className="gap-1.5">
            <Printer className="h-3.5 w-3.5" />
            Print
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!generated && !error && (
        <div className="flex flex-col items-center justify-center gap-2 py-20 border border-dashed border-border rounded-2xl print:hidden">
          <p className="text-sm font-medium text-foreground">Select a section and date range, then generate a report.</p>
        </div>
      )}

      {generated && !loading && !error && report && report.dates.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 py-20 border border-dashed border-border rounded-2xl print:hidden">
          <p className="text-sm font-medium text-foreground">No dates found.</p>
          <p className="text-xs text-muted-foreground">No submitted registers for this section in the selected date range.</p>
        </div>
      )}

      {generated && report && report.dates.length > 0 && (
        <div className="space-y-6 bg-card border border-border rounded-2xl overflow-hidden attendance-report-print-target p-4">
          <div>
            <h3 className="text-sm font-semibold mb-2">
              Overall Summary ({format(parseISO(dateFrom), 'd MMM yyyy')} – {format(parseISO(dateTo), 'd MMM yyyy')})
            </h3>
            <Table className="border">
              <TableHeader>
                <TableRow>
                  <TableHead className="border-r">GR No</TableHead>
                  <TableHead className="border-r">Student</TableHead>
                  <TableHead className="text-center border-r">Total %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.students.map((student) => (
                  <TableRow key={student.studentId}>
                    <TableCell className="border-r">{student.grNo}</TableCell>
                    <TableCell className="border-r">{student.studentName}</TableCell>
                    <TableCell className="text-center font-medium border-r">{student.percentage}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {monthGroups.map((group) => (
            <div key={group.key} className="pt-6">
              <h3 className="text-sm font-semibold mb-2">{group.label}</h3>
              <Table className="border">
                <TableHeader>
                  <TableRow>
                    <TableHead className="border-r">GR No</TableHead>
                    <TableHead className="border-r">Student</TableHead>
                    {group.dates.map((date) => (
                      <TableHead key={date} className="text-center border-r">{format(parseISO(date), 'd')}</TableHead>
                    ))}
                    <TableHead className="text-center">Total %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.students.map((student) => (
                    <TableRow key={student.studentId}>
                      <TableCell className="border-r">{student.grNo}</TableCell>
                      <TableCell className="border-r">{student.studentName}</TableCell>
                      {group.dates.map((date) => (
                        <TableCell key={date} className="text-center border-r">
                          {student.recordsByDate[date] ? STATUS_CODE[student.recordsByDate[date]] : ''}
                        </TableCell>
                      ))}
                      <TableCell className="text-center font-medium">{student.percentage}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
