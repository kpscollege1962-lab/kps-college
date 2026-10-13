import SheetReportDialog from '@/modules/homework/components/SheetReportDialog'

export default function AssignmentsReportDialog({ open, onOpenChange, group }) {
  if (!group) return null

  return (
    <SheetReportDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Report ${group.label}`}
      label={group.label}
      view={group.view}
      assignments={group.assignments}
      editableQuote
    />
  )
}