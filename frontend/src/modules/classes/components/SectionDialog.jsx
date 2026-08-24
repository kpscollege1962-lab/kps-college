import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import SectionForm from './SectionForm'

export default function SectionDialog({
  open,
  onOpenChange,
  initialData,
  className,   // class name string for display in the description
  onSubmit,
  saving,
  error,
  fieldErrors,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Rename Section' : 'Add Section'}</DialogTitle>
          <DialogDescription>
            {initialData
              ? `Rename this section in ${className}.`
              : `Add a new section to ${className}.`}
          </DialogDescription>
        </DialogHeader>
        <SectionForm
          initialData={initialData}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          saving={saving}
          error={error}
          fieldErrors={fieldErrors}
        />
      </DialogContent>
    </Dialog>
  )
}
