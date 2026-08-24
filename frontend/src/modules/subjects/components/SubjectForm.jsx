import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  { value: 'science',  label: 'Science'  },
  { value: 'arts',     label: 'Arts'     },
  { value: 'commerce', label: 'Commerce' },
  { value: 'general',  label: 'General'  },
]

export default function SubjectForm({
  initialData = null,
  onSubmit,
  onCancel,
  saving = false,
  error = null,
  fieldErrors = {},
}) {
  const [name, setName]               = useState(initialData?.name ?? '')
  const [nameInitials, setNameInitials] = useState(initialData?.name_initials ?? '')
  const [category, setCategory]       = useState(initialData?.category ?? '')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      name: name.trim(),
      name_initials: nameInitials.trim() || null,
      category,
    })
  }

  const selectedLabel = CATEGORIES.find(c => c.value === category)?.label

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>

      <div className="space-y-1.5">
        <Label>
          Subject Name <span className="text-destructive">*</span>
        </Label>
        <Input
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Mathematics, Urdu, Physics"
          required
          disabled={saving}
        />
        {fieldErrors.name && (
          <p className="text-xs text-destructive">{fieldErrors.name}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Name Initials</Label>
        <Input
          name="name_initials"
          value={nameInitials}
          onChange={(e) => setNameInitials(e.target.value)}
          placeholder="e.g. MATH, PHY, URD"
          disabled={saving}
        />
        <p className="text-xs text-muted-foreground">
          Short name used in timetable slots. Leave blank to use full name.
        </p>
        {fieldErrors.name_initials && (
          <p className="text-xs text-destructive">{fieldErrors.name_initials}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>
          Category <span className="text-destructive">*</span>
        </Label>
        <Select value={category} onValueChange={setCategory} disabled={saving}>
          <SelectTrigger className="w-full">
            <span className={cn('flex flex-1 text-left text-sm', !category && 'text-muted-foreground')}>
              {selectedLabel ?? 'Select a category'}
            </span>
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fieldErrors.category && (
          <p className="text-xs text-destructive">{fieldErrors.category}</p>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-2 pt-1">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : initialData ? 'Save Changes' : 'Create Subject'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </div>

    </form>
  )
}
