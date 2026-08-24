import { useState, useEffect } from 'react'
import { useAbility } from '@casl/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AbilityContext, Can } from '@/casl/AbilityProvider'
import { TimePicker } from '@/components/ui/time-picker'

const MONTHS = [
  { value: '1',  label: 'January' },
  { value: '2',  label: 'February' },
  { value: '3',  label: 'March' },
  { value: '4',  label: 'April' },
  { value: '5',  label: 'May' },
  { value: '6',  label: 'June' },
  { value: '7',  label: 'July' },
  { value: '8',  label: 'August' },
  { value: '9',  label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
]

const DAYS = [
  { value: 'sunday',    label: 'Sun' },
  { value: 'monday',    label: 'Mon' },
  { value: 'tuesday',   label: 'Tue' },
  { value: 'wednesday', label: 'Wed' },
  { value: 'thursday',  label: 'Thu' },
  { value: 'friday',    label: 'Fri' },
  { value: 'saturday',  label: 'Sat' },
]

const fromData = (raw) => ({
  tagline:                   raw?.tagline                   ?? '',
  academic_year_start_month: raw?.academic_year_start_month != null ? String(raw.academic_year_start_month) : '',
  default_pass_percentage:   raw?.default_pass_percentage   != null ? String(raw.default_pass_percentage)   : '',
  min_attendance_percentage: raw?.min_attendance_percentage != null ? String(raw.min_attendance_percentage) : '',
  working_days:              raw?.working_days ?? null,
  school_start_time:         raw?.school_start_time ? raw.school_start_time.slice(0, 5) : '',
  school_end_time:           raw?.school_end_time   ? raw.school_end_time.slice(0, 5)   : '',
  late_arrival_minutes:      raw?.late_arrival_minutes      != null ? String(raw.late_arrival_minutes)      : '',
  max_students_per_section:  raw?.max_students_per_section  != null ? String(raw.max_students_per_section)  : '',
})

export default function CampusSettingsForm({ initialData = null, onSubmit, saving = false, error = null, fieldErrors = {} }) {
  const ability   = useAbility(AbilityContext)
  const canUpdate = ability.can('update', 'CampusSettings')

  const [form, setForm] = useState(() => fromData(initialData?.raw))

  useEffect(() => {
    setForm(fromData(initialData?.raw))
  }, [initialData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelect = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleTimeChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleToggleDay = (day) => {
    setForm((prev) => {
      const current = prev.working_days ?? []
      const next = current.includes(day)
        ? current.filter((d) => d !== day)
        : [...current, day]
      return { ...prev, working_days: next }
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>

      {/* ── Section 1: Branding ──────────────────────────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Branding</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          {/* Tagline */}
          <div className="space-y-1.5">
            <Label>Tagline / Motto</Label>
            <Input
              name="tagline"
              value={form.tagline}
              onChange={handleChange}
              disabled={saving || !canUpdate}
            />
            {fieldErrors.tagline && (
              <p className="text-xs text-destructive">{fieldErrors.tagline}</p>
            )}
          </div>

        </div>
      </div>

      {/* ── Section 2: Academic Defaults ─────────────────────────────────── */}
      <div className="space-y-4 border-t border-border pt-6">
        <h2 className="text-sm font-semibold text-foreground">Academic Defaults</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          {/* Academic Year Start Month */}
          <div className="space-y-1.5">
            <Label>Academic Year Starts</Label>
            <Select
              value={form.academic_year_start_month || undefined}
              onValueChange={(val) => handleSelect('academic_year_start_month', val)}
              disabled={saving || !canUpdate}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.academic_year_start_month ? (
              <p className="text-xs text-destructive">{fieldErrors.academic_year_start_month}</p>
            ) : initialData !== null && initialData?.raw?.academic_year_start_month == null && initialData?.resolved?.academic_year_start_month != null ? (
              <p className="text-xs text-muted-foreground">
                Inheriting from school settings: {MONTHS.find((m) => m.value === String(initialData.resolved.academic_year_start_month))?.label}
              </p>
            ) : null}
          </div>

          {/* Default Pass % */}
          <div className="space-y-1.5">
            <Label>Default Pass %</Label>
            <Input
              type="number"
              name="default_pass_percentage"
              value={form.default_pass_percentage}
              onChange={handleChange}
              min={0}
              max={100}
              step={0.01}
              disabled={saving || !canUpdate}
            />
            {fieldErrors.default_pass_percentage ? (
              <p className="text-xs text-destructive">{fieldErrors.default_pass_percentage}</p>
            ) : initialData !== null && initialData?.raw?.default_pass_percentage == null && initialData?.resolved?.default_pass_percentage != null ? (
              <p className="text-xs text-muted-foreground">
                Inheriting from school settings: {initialData.resolved.default_pass_percentage}
              </p>
            ) : null}
          </div>

          {/* Min. Attendance % */}
          <div className="space-y-1.5">
            <Label>Min. Attendance %</Label>
            <Input
              type="number"
              name="min_attendance_percentage"
              value={form.min_attendance_percentage}
              onChange={handleChange}
              min={0}
              max={100}
              step={0.01}
              disabled={saving || !canUpdate}
            />
            {fieldErrors.min_attendance_percentage ? (
              <p className="text-xs text-destructive">{fieldErrors.min_attendance_percentage}</p>
            ) : initialData !== null && initialData?.raw?.min_attendance_percentage == null && initialData?.resolved?.min_attendance_percentage != null ? (
              <p className="text-xs text-muted-foreground">
                Inheriting from school settings: {initialData.resolved.min_attendance_percentage}
              </p>
            ) : null}
          </div>

        </div>
      </div>

      {/* ── Section 3: Operations / Timing ───────────────────────────────── */}
      <div className="space-y-4 border-t border-border pt-6">
        <h2 className="text-sm font-semibold text-foreground">Operations / Timing</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          {/* School Start Time */}
          <div className="space-y-1.5">
            <Label>School Start Time</Label>
            <TimePicker
              value={form.school_start_time}
              onChange={(val) => handleTimeChange('school_start_time', val)}
              disabled={saving || !canUpdate}
            />
            {fieldErrors.school_start_time && (
              <p className="text-xs text-destructive">{fieldErrors.school_start_time}</p>
            )}
          </div>

          {/* School End Time */}
          <div className="space-y-1.5">
            <Label>School End Time</Label>
            <TimePicker
              value={form.school_end_time}
              onChange={(val) => handleTimeChange('school_end_time', val)}
              disabled={saving || !canUpdate}
            />
            {fieldErrors.school_end_time && (
              <p className="text-xs text-destructive">{fieldErrors.school_end_time}</p>
            )}
          </div>

          {/* Late Arrival Grace */}
          <div className="space-y-1.5">
            <Label>Late Arrival Grace (minutes)</Label>
            <Input
              type="number"
              name="late_arrival_minutes"
              value={form.late_arrival_minutes}
              onChange={handleChange}
              min={0}
              max={120}
              disabled={saving || !canUpdate}
            />
            {fieldErrors.late_arrival_minutes ? (
              <p className="text-xs text-destructive">{fieldErrors.late_arrival_minutes}</p>
            ) : (
              <p className="text-xs text-muted-foreground">Minutes after start time before marking a student late</p>
            )}
          </div>

          {/* Default Section Capacity */}
          <div className="space-y-1.5">
            <Label>Default Section Capacity</Label>
            <Input
              type="number"
              name="max_students_per_section"
              value={form.max_students_per_section}
              onChange={handleChange}
              min={1}
              max={500}
              disabled={saving || !canUpdate}
            />
            {fieldErrors.max_students_per_section && (
              <p className="text-xs text-destructive">{fieldErrors.max_students_per_section}</p>
            )}
          </div>

          {/* Working Days */}
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Working Days</Label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => {
                const isActive = (form.working_days ?? []).includes(day.value)
                return (
                  <Button
                    key={day.value}
                    type="button"
                    variant={isActive ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleToggleDay(day.value)}
                    disabled={saving || !canUpdate}
                  >
                    {day.label}
                  </Button>
                )
              })}
            </div>
            {fieldErrors.working_days && (
              <p className="text-xs text-destructive">{fieldErrors.working_days}</p>
            )}
          </div>

        </div>
      </div>

      {/* Error banner */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <Can I="update" a="CampusSettings">
        <div className="flex items-center gap-2 pt-1">
          <Button type="submit" disabled={saving || !canUpdate}>
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </Can>

    </form>
  )
}
