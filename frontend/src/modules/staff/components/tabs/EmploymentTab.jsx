import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { DatePicker } from '@/components/ui/date-picker'

export default function EmploymentTab({ form, setForm, fieldErrors, saving, isCreate }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

      <div className="space-y-1.5">
        <Label>Employee No</Label>
        <Input
          value={form.employee_no}
          onChange={(e) => setForm(prev => ({ ...prev, employee_no: e.target.value }))}
          placeholder="e.g. EMP-001"
          disabled={saving}
        />
        {fieldErrors.employee_no && (
          <p className="text-xs text-destructive">{fieldErrors.employee_no}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Joining Date</Label>
        <DatePicker
          value={form.joining_date}
          onChange={(val) => setForm(prev => ({ ...prev, joining_date: val ?? '' }))}
          disabled={saving}
          placeholder="Pick a date"
          fromYear={1990}
          toYear={new Date().getFullYear()}
        />
        {fieldErrors.joining_date && (
          <p className="text-xs text-destructive">{fieldErrors.joining_date}</p>
        )}
      </div>

      <div className="space-y-1.5 sm:col-span-2">
        <Label>Available for Timetable</Label>
        <div className="flex items-center gap-2">
          <Switch
            checked={form.is_timetable_eligible === 1}
            onCheckedChange={(checked) =>
              setForm(prev => ({ ...prev, is_timetable_eligible: checked ? 1 : 0 }))
            }
            disabled={saving}
          />
          <span className="text-sm text-muted-foreground">
            {form.is_timetable_eligible === 1
              ? 'Shown in timetable panel'
              : 'Hidden from timetable panel'}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Enable to include this staff member in the timetable slot assignment panel
          for this campus.
        </p>
      </div>

      <div className="space-y-1.5 sm:col-span-2">
        <Label>Allow Concurrent Periods</Label>
        <div className="flex items-center gap-2">
          <Switch
            checked={form.allow_concurrent_periods === 1}
            onCheckedChange={(checked) =>
              setForm(prev => ({ ...prev, allow_concurrent_periods: checked ? 1 : 0 }))
            }
            disabled={saving}
          />
          <span className="text-sm text-muted-foreground">
            {form.allow_concurrent_periods === 1
              ? 'Can teach multiple classes in the same period'
              : 'Restricted to one class per period'}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Enable to exempt this staff member from the single-class-per-period rule —
          e.g. a PET teacher running the same drill period across multiple
          classes/sections at once.
        </p>
      </div>

    </div>
  )
}
