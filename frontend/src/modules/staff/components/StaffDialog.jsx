import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import StaffForm from './StaffForm'

export default function StaffDialog({ open, onOpenChange, initialData, onSubmit, saving, error, fieldErrors }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl overflow-y-auto max-h-[calc(100svh-4rem)]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Staff Member' : 'Add Staff Member'}</DialogTitle>
          <DialogDescription>
            {initialData
              ? 'Update the staff member\'s details below.'
              : 'Fill in the details to add a new staff member.'}
          </DialogDescription>
        </DialogHeader>
        <StaffForm
          key={initialData?.id ?? 'new'}
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
