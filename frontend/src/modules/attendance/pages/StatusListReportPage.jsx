import { useState } from 'react'
import { format } from 'date-fns'
import { Printer, Pencil, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DatePicker } from '@/components/ui/date-picker'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { Can } from '@/casl/AbilityProvider'
import { useSessionContext } from '@/shells/portal/hooks/useSessionContext'
import { useRoleContext } from '@/modules/auth/hooks/useRoleContext'
import { useStatusListReport } from '../hooks/useStatusListReport'
import '../styles/attendance-report-print.css'

const STATUS_OPTIONS = ['present', 'absent', 'late', 'leave']

const STATUS_BADGE_CLASS = {
  present: 'bg-green-100 text-green-700',
  absent: 'bg-red-100 text-red-700',
  late: 'bg-amber-100 text-amber-700',
  leave: 'bg-blue-100 text-blue-700',
}

const renderContact = (record) => {
  const contacts = record.contacts ?? []
  if (contacts.length === 0) {
    return <span className="text-muted-foreground">—</span>
  }

  const primary = contacts.find((c) => c.isPrimary) ?? contacts[0]
  const others = contacts.filter((c) => c.id !== primary.id)

  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      <span>
        <span className="text-muted-foreground">{primary.label}</span>
        {' — '}
        {primary.phone}
        {primary.name && <span className="text-muted-foreground">{` — ${primary.name}`}</span>}
      </span>
      {others.length > 0 && (
        <Popover>
          <PopoverTrigger className="text-xs text-primary underline underline-offset-2 shrink-0">
            +{others.length} more
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="space-y-1.5">
              {others.map((c) => (
                <div key={c.id} className="text-xs">
                  <span className="text-muted-foreground">{c.label}</span>
                  {' — '}
                  {c.phone}
                  {c.name && <span className="text-muted-foreground">{` — ${c.name}`}</span>}
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}

const RemarksCell = ({ record, onSave }) => {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(record.remarks ?? '')
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)

  const handleOpenChange = (next) => {
    if (next) {
      setValue(record.remarks ?? '')
      setErrorMsg(null)
    }
    setOpen(next)
  }

  const handleSave = async () => {
    setSaving(true)
    setErrorMsg(null)
    const result = await onSave(record.recordId, value.trim() || null)
    setSaving(false)
    if (result.success) {
      setOpen(false)
    } else {
      setErrorMsg(result.message || 'Failed to save remarks')
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <span>{record.remarks ?? '—'}</span>
      <Can I="updateRemarks" a="Attendance">
        <Popover open={open} onOpenChange={handleOpenChange}>
          <PopoverTrigger className="print:hidden text-muted-foreground hover:text-foreground shrink-0">
            <Pencil className="h-3 w-3" />
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="space-y-2">
              <Textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                maxLength={255}
                rows={3}
                placeholder="Enter remarks…"
              />
              {errorMsg && <p className="text-xs text-destructive">{errorMsg}</p>}
              <Button size="sm" onClick={handleSave} disabled={saving} className="w-full gap-1.5">
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </Can>
    </div>
  )
}

export default function StatusListReportPage() {
  const { activeSession } = useSessionContext()
  const { activeRole } = useRoleContext()
  const campusId = activeRole?.campusId

  const {
    records, loading, error, generated, generateReport, updateRecordRemarks,
  } = useStatusListReport(campusId)

  const today = format(new Date(), 'yyyy-MM-dd')
  const [dateFrom, setDateFrom] = useState(today)
  const [dateTo, setDateTo] = useState(today)
  const [statuses, setStatuses] = useState(['absent'])

  const toggleStatus = (status, checked) => {
    setStatuses((prev) => (checked ? [...prev, status] : prev.filter((s) => s !== status)))
  }

  const handleGenerate = () => {
    if (!activeSession?.id || !dateFrom || !dateTo || statuses.length === 0) return
    generateReport({ sessionId: activeSession.id, dateFrom, dateTo, statuses })
  }

  const canGenerate = Boolean(activeSession?.id && dateFrom && dateTo && statuses.length > 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4 print:hidden">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">From</p>
          <DatePicker value={dateFrom} onChange={setDateFrom} className="w-40" />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">To</p>
          <DatePicker value={dateTo} onChange={setDateTo} className="w-40" />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Status</p>
          <div className="flex items-center gap-4 h-9">
            {STATUS_OPTIONS.map((status) => (
              <label key={status} className="flex items-center gap-1.5 text-sm capitalize cursor-pointer">
                <Checkbox
                  checked={statuses.includes(status)}
                  onCheckedChange={(checked) => toggleStatus(status, checked === true)}
                />
                {status}
              </label>
            ))}
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={!canGenerate || loading}>
          {loading ? 'Generating…' : 'Generate Report'}
        </Button>
        {generated && records.length > 0 && (
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
          <p className="text-sm font-medium text-foreground">Select a date range and status, then generate a report.</p>
        </div>
      )}

      {generated && !loading && !error && records.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 py-20 border border-dashed border-border rounded-2xl print:hidden">
          <p className="text-sm font-medium text-foreground">No records found.</p>
          <p className="text-xs text-muted-foreground">No submitted registers match this date range and status filter.</p>
        </div>
      )}

      {generated && records.length > 0 && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden attendance-report-print-target">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Class/Section</TableHead>
                <TableHead>GR No</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Father Name</TableHead>
                <TableHead className="print:hidden">Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record, i) => (
                <TableRow key={`${record.date}-${record.studentId}-${i}`}>
                  <TableCell>{format(record.date, 'dd-MMM-yyyy')}</TableCell>
                  <TableCell>{record.sectionName ? `${record.className} ${record.sectionName}` : record.className}</TableCell>
                  <TableCell>{record.grNo}</TableCell>
                  <TableCell>{record.studentName}</TableCell>
                  <TableCell>{record.fatherName}</TableCell>
                  <TableCell className="print:hidden">{renderContact(record)}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_BADGE_CLASS[record.status]}>{record.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <RemarksCell record={record} onSave={updateRecordRemarks} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
