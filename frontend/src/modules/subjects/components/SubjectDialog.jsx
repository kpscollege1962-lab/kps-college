import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import SubjectForm from './SubjectForm'

export default function SubjectDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  saving,
  error,
  fieldErrors,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Subject' : 'Add Subject'}</DialogTitle>
          <DialogDescription>
            {initialData
              ? "Update this subject's details. Changes apply school-wide."
              : "Add a new subject to the school's subject catalogue."}
          </DialogDescription>
        </DialogHeader>
        <SubjectForm
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
