import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import SheetReportPanel from './SheetReportPanel'

// The report in a popup (admin, principal and teacher "Generate Report" screens).
// Everything inside is SheetReportPanel; this file only adds the dialog frame and title.
export default function SheetReportDialog({ open, onOpenChange, title, ...panelProps }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <SheetReportPanel
          {...panelProps}
          active={open}
          onClose={() => onOpenChange(false)}
          Footer={DialogFooter}
        />
      </DialogContent>
    </Dialog>
  )
}
