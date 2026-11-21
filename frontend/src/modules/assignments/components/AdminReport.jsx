import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import RichText from '@/modules/homework/components/RichText'
import SheetReportPanel from '@/modules/homework/components/SheetReportPanel'

const VIEW_TITLE = { teacher: 'Teacher-wise', subject: 'Subject-wise', class: 'Class-wise' }

// An admin proforma shown inline on the Assignments page (not in a popup): the same report body
// as before (dates + "Available" chips for the days in the chosen range, editable quote, preview,
// Download JPG, Print) via the shared SheetReportPanel. Built from the assignments, so edits and
// deletes show up the next time it is opened.
// The report opens on today if it has work, else the newest assigned date (SheetReportPanel).
export default function AdminReport({ campusId, group, view, onBack }) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">
            {VIEW_TITLE[view]} report: <RichText text={group.label} ordinal />
          </h2>
          {view === 'class' && group.formMaster && (
            <p className="text-sm text-muted-foreground">Form master: {group.formMaster}</p>
          )}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-1.5 size-3.5" />
          Back
        </Button>
      </div>

      <div className="grid gap-4 rounded-xl bg-card p-4 text-sm ring-1 ring-foreground/10">
        <SheetReportPanel
          active
          onClose={onBack}
          campusId={campusId}
          label={group.label}
          view={view}
          assignments={group.assignments}
          editableQuote
        />
      </div>
    </section>
  )
}
