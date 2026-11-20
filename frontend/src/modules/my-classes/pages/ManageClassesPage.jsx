import { useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRoleContext } from '@/modules/auth/hooks/useRoleContext'
import { useSessionContext } from '@/shells/portal/hooks/useSessionContext'
import { useMyTimetable } from '../hooks/useMyTimetable'
import { useMyFormMasterClasses } from '../hooks/useMyFormMasterClasses'
import { buildCards, buildTargets } from '../utils/timetableEntries'
import TeacherTimetable from '../components/TeacherTimetable'
import AssignmentsSection from '../components/AssignmentsSection'
import FormMasterPicker from '../components/FormMasterPicker'
import FormMasterReport from '../components/FormMasterReport'

const REPORT_PARAM = 'report' // ?report=<classGroupId>-<sectionId>

// The teacher's home for their classes: their timetable on top, the assignments below.
// A timetable card opens that class (its students).
//
// "View Report" is the form master's proforma, not tied to the Assignments filter: it is the
// class-wide report for a class where this teacher has Period 1. No such class: no button.
// One: it opens straight away. Several: a small picker asks which one first.
// The report replaces the assignments area on this page; which class is open lives in the URL,
// so a refresh keeps it and browser Back closes it.
export default function ManageClassesPage() {
  const { activeRole } = useRoleContext()
  const { activeSession } = useSessionContext()
  const campusId = activeRole?.campusId
  const sessionId = activeSession?.id

  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  const { entries, loading, error } = useMyTimetable(campusId)
  const { classes: formClasses, loaded: formLoaded } = useMyFormMasterClasses(campusId)
  const [pickerOpen, setPickerOpen] = useState(false)

  const cards = useMemo(() => buildCards(entries), [entries])
  const targets = useMemo(() => buildTargets(entries), [entries])

  // Only a class the teacher is form master of can be opened from the URL (the server checks too).
  const reportKey = searchParams.get(REPORT_PARAM)
  const reportClass = reportKey ? formClasses.find((c) => c.key === reportKey) ?? null : null
  const reportPending = Boolean(reportKey) && !formLoaded
  const reportInvalid = Boolean(reportKey) && formLoaded && !reportClass
  const showReport = Boolean(reportClass)

  const openReport = (formClass) => {
    setPickerOpen(false)
    const next = new URLSearchParams(searchParams)
    next.set(REPORT_PARAM, formClass.key)
    setSearchParams(next, { state: { reportFromList: true } })
  }

  const closeReport = () => {
    // Opened from this page: step back in history, so browser Forward/Back stay natural.
    // Opened by refresh or a pasted link: there is no list entry behind it, so drop the param.
    if (location.state?.reportFromList) return navigate(-1)
    const next = new URLSearchParams(searchParams)
    next.delete(REPORT_PARAM)
    setSearchParams(next, { replace: true })
  }

  const handleViewReport = () => {
    if (formClasses.length === 1) openReport(formClasses[0])
    else setPickerOpen(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Manage classes</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Your timetable and the assignments you give to your classes.
        </p>
      </div>

      <TeacherTimetable cards={cards} loading={loading} error={error} />

      {reportInvalid && (
        <p className="text-sm text-muted-foreground">
          That report is not available: you are not the form master (Period 1 teacher) of that class.{' '}
          <button type="button" className="underline underline-offset-2" onClick={closeReport}>Dismiss</button>
        </p>
      )}

      {showReport && (
        <FormMasterReport
          key={reportClass.key}
          campusId={campusId}
          sessionId={sessionId}
          formClass={reportClass}
          onBack={closeReport}
        />
      )}

      {/* Kept mounted while the report shows, so the filters are as the teacher left them. */}
      <div hidden={showReport || reportPending}>
        <AssignmentsSection
          campusId={campusId}
          sessionId={sessionId}
          targets={targets}
          timetableLoading={loading}
        />

        {formClasses.length > 0 && (
          <div className="flex justify-end pt-8">
            <Button type="button" size="sm" variant="outline" onClick={handleViewReport}>
              <FileText className="mr-1.5 size-3.5" />
              View Report
            </Button>
          </div>
        )}
      </div>

      <FormMasterPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        classes={formClasses}
        onPick={openReport}
      />
    </div>
  )
}
