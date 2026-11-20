import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import RichText from '@/modules/homework/components/RichText'
import SheetReportPanel from '@/modules/homework/components/SheetReportPanel'
import { classLabelText } from '@/modules/homework/utils/labels'
import { getFormMasterReportService } from '../services/teacherWorkspace.service'

// The form master's proforma, shown inline on Manage classes (not in a popup): every subject's
// classwork and homework for ONE class, whoever posted it. The body is the shared
// SheetReportPanel in its "class" view (boxes titled subject + teacher), the same content,
// print and download as the report dialogs; only the frame around it is new.
export default function FormMasterReport({ campusId, sessionId, formClass, onBack }) {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { classGroupId, sectionId } = formClass

  useEffect(() => {
    if (!campusId || !sessionId) return
    let cancelled = false
    setLoading(true)
    setError(null)
    getFormMasterReportService(campusId, { sessionId, classGroupId, sectionId }).then((result) => {
      if (cancelled) return
      setLoading(false)
      if (result.success) setAssignments(result.data.assignments)
      else { setAssignments([]); setError(result.message) }
    })
    return () => { cancelled = true }
  }, [campusId, sessionId, classGroupId, sectionId])

  const label = classLabelText(formClass.className, formClass.sectionName)

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">
          View Report: <RichText text={label} ordinal />
        </h2>
        <Button type="button" variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-1.5 size-3.5" />
          Back to assignments
        </Button>
      </div>

      <div className="grid gap-4 rounded-xl bg-card p-4 text-sm ring-1 ring-foreground/10">
        <SheetReportPanel
          active
          onClose={onBack}
          campusId={campusId}
          label={label}
          view="class"
          assignments={assignments}
          loading={loading || !sessionId}
          error={error}
        />
      </div>
    </section>
  )
}
