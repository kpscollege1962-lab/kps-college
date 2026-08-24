import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import ClassForm from './ClassForm'

export default function ClassDialog({
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
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Class' : 'Create Class'}</DialogTitle>
          <DialogDescription>
            {initialData
              ? 'Update the class name, level, or academic level.'
              : 'Add a new class to this campus for the current session.'}
          </DialogDescription>
        </DialogHeader>
        <ClassForm
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
