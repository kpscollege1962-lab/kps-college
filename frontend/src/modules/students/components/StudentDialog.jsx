import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import StudentForm from './StudentForm'

export default function StudentDialog({ open, onOpenChange, initialData, onSubmit, saving, error, fieldErrors }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl overflow-y-auto max-h-[calc(100svh-4rem)]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Student' : 'Add Student'}</DialogTitle>
          <DialogDescription>
            {initialData
              ? 'Update the student\'s details below.'
              : 'Fill in the details to register a new student.'}
          </DialogDescription>
        </DialogHeader>
        <StudentForm
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
