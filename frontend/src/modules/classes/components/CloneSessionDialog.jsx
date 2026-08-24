import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'

export default function CloneSessionDialog({
  open,
  onOpenChange,
  sessions,          // all sessions from sessionContext
  currentSessionId,  // target session (excluded from source options)
  onConfirm,         // (sourceSessionId) => Promise<result>
  saving,
}) {
  const [sourceSessionId, setSourceSessionId] = useState('')
  const [error, setError]                     = useState(null)

  const availableSessions = sessions.filter((s) => s.id !== currentSessionId)

  const handleOpenChange = (next) => {
    if (!next && saving) return
    if (!next) { setError(null); setSourceSessionId('') }
    onOpenChange(next)
  }

  const handleConfirm = async () => {
    if (!sourceSessionId) return
    setError(null)
    const result = await onConfirm(parseInt(sourceSessionId))
    if (result.success) {
      onOpenChange(false)
    } else {
      setError(result.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Clone Classes from Session</DialogTitle>
          <DialogDescription>
            Copy all classes and their sections from another session into the current session.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Source Session <span className="text-destructive">*</span></Label>
            <Select value={sourceSessionId} onValueChange={setSourceSessionId} disabled={saving}>
              <SelectTrigger>
                <span className={cn('flex flex-1 text-left text-sm', !sourceSessionId && 'text-muted-foreground')}>
                  {availableSessions.find(s => String(s.id) === sourceSessionId)?.name ?? 'Select a session to clone from'}
                </span>
              </SelectTrigger>
              <SelectContent>
                {availableSessions.length === 0 && (
                  <SelectItem value="__none__" disabled>No other sessions available</SelectItem>
                )}
                {availableSessions.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex items-center gap-2 pt-1">
            <Button onClick={handleConfirm} disabled={saving || !sourceSessionId}>
              {saving ? 'Cloning…' : 'Clone Classes'}
            </Button>
            <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
