import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import RichText from '@/modules/homework/components/RichText'
import { classLabelText } from '@/modules/homework/utils/labels'

// Shown only when the teacher is form master of more than one class: pick which proforma to open.
export default function FormMasterPicker({ open, onOpenChange, classes, onPick }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Choose a class</DialogTitle>
          <DialogDescription>You are form master (Period 1) of these classes.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          {classes.map((c) => (
            <Button key={c.key} type="button" variant="outline" className="justify-start" onClick={() => onPick(c)}>
              <RichText text={classLabelText(c.className, c.sectionName)} ordinal />
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
