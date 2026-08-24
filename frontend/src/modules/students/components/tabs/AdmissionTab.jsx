import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'

export default function AdmissionTab({ form, handleChange, setForm, fieldErrors, saving }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

      <div className="space-y-1.5">
        <Label>GR No <span className="text-destructive">*</span></Label>
        <Input
          name="gr_no"
          value={form.gr_no}
          onChange={handleChange}
          placeholder="e.g. 2024-001"
          required
          disabled={saving}
        />
        {fieldErrors.gr_no && (
          <p className="text-xs text-destructive">{fieldErrors.gr_no}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Admission Date</Label>
        <DatePicker
          value={form.admission_date}
          onChange={(val) => setForm((prev) => ({ ...prev, admission_date: val }))}
          disabled={saving}
          placeholder="Pick a date"
          fromYear={2000}
          toYear={new Date().getFullYear() + 1}
        />
        {fieldErrors.admission_date && (
          <p className="text-xs text-destructive">{fieldErrors.admission_date}</p>
        )}
      </div>

    </div>
  )
}
