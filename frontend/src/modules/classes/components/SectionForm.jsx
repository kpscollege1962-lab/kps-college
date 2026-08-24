import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function SectionForm({
  initialData = null,
  onSubmit,
  onCancel,
  saving = false,
  error = null,
  fieldErrors = {},
}) {
  const [name, setName] = useState(initialData?.name ?? '')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ name: name.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>

      <div className="space-y-1.5">
        <Label>
          Section Name <span className="text-destructive">*</span>
        </Label>
        <Input
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. A, B, Red, Blue"
          required
          disabled={saving}
        />
        {fieldErrors.name && (
          <p className="text-xs text-destructive">{fieldErrors.name}</p>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-2 pt-1">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : initialData ? 'Save Changes' : 'Create Section'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </div>

    </form>
  )
}
