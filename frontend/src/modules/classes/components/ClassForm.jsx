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

const ACADEMIC_LEVELS = [
  { value: 'pre_primary',      label: 'Pre-Primary'      },
  { value: 'primary',          label: 'Primary'          },
  { value: 'middle',           label: 'Middle'           },
  { value: 'secondary',        label: 'Secondary'        },
  { value: 'higher_secondary', label: 'Higher Secondary' },
]

export default function ClassForm({
  initialData = null,
  onSubmit,
  onCancel,
  saving = false,
  error = null,
  fieldErrors = {},
}) {
  const [name,          setName]          = useState(initialData?.name           ?? '')
  const [level,         setLevel]         = useState(initialData?.level          ?? '')
  const [academicLevel, setAcademicLevel] = useState(initialData?.academic_level ?? '')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      name:           name.trim(),
      level:          parseInt(level, 10),
      academic_level: academicLevel,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label>Class Name <span className="text-destructive">*</span></Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Class 9, Grade 5"
          disabled={saving}
        />
        {fieldErrors.name && <p className="text-xs text-destructive">{fieldErrors.name}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Level <span className="text-destructive">*</span></Label>
        <Input
          type="number"
          min={1}
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          placeholder="e.g. 12"
          disabled={saving}
        />
        <p className="text-xs text-muted-foreground">Numeric sort order for display (e.g. 1 for Playgroup, 12 for Class 9)</p>
        {fieldErrors.level && <p className="text-xs text-destructive">{fieldErrors.level}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Academic Level <span className="text-destructive">*</span></Label>
        <Select value={academicLevel} onValueChange={setAcademicLevel} disabled={saving}>
          <SelectTrigger>
            <span className={cn('flex flex-1 text-left text-sm', !academicLevel && 'text-muted-foreground')}>
              {ACADEMIC_LEVELS.find(al => al.value === academicLevel)?.label ?? 'Select academic level'}
            </span>
          </SelectTrigger>
          <SelectContent>
            {ACADEMIC_LEVELS.map((al) => (
              <SelectItem key={al.value} value={al.value}>{al.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fieldErrors.academic_level && <p className="text-xs text-destructive">{fieldErrors.academic_level}</p>}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-2 pt-1">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : initialData ? 'Save Changes' : 'Create Class'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
