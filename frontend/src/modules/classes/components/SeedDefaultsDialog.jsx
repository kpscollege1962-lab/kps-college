import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function SeedDefaultsDialog({ open, onOpenChange, onConfirm, saving }) {
  const [error, setError] = useState(null)

  const handleOpenChange = (next) => {
    if (!next && saving) return
    if (!next) setError(null)
    onOpenChange(next)
  }

  const handleConfirm = async () => {
    setError(null)
    const result = await onConfirm()
    if (result.success) {
      onOpenChange(false)
    } else {
      setError(result.message)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Load Standard Classes</AlertDialogTitle>
          <AlertDialogDescription>
            This will create the standard Pakistani curriculum classes (Playgroup through Class 12) for this campus and session. You can add, rename, or remove classes afterwards.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={saving}>
            {saving ? 'Loading…' : 'Load Standard Classes'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
