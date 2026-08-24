import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DatePicker } from '@/components/ui/date-picker'

export default function AcademicSessionForm({ initialData = null, onSubmit, onCancel, saving = false, error = null, fieldErrors = {} }) {
  const [form, setForm] = useState({
    name: initialData?.name ?? '',
    start_date: initialData?.start_date ?? '',
    end_date: initialData?.end_date ?? '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      name: form.name.trim(),
      start_date: form.start_date,
      end_date: form.end_date,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

        {/* Name */}
        <div className="space-y-1.5">
          <Label>Session Name <span className="text-destructive">*</span></Label>
          <Input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. 2026"
            required
            disabled={saving}
          />
          {fieldErrors.name && (
            <p className="text-xs text-destructive">{fieldErrors.name}</p>
          )}
        </div>

        {/* Start Date */}
        <div className="space-y-1.5">
          <Label>Start Date <span className="text-destructive">*</span></Label>
          <DatePicker
            value={form.start_date}
            onChange={(val) => setForm((prev) => ({ ...prev, start_date: val }))}
            disabled={saving}
            placeholder="Pick start date"
          />
          {fieldErrors.start_date && (
            <p className="text-xs text-destructive">{fieldErrors.start_date}</p>
          )}
        </div>

        {/* End Date */}
        <div className="space-y-1.5">
          <Label>End Date <span className="text-destructive">*</span></Label>
          <DatePicker
            value={form.end_date}
            onChange={(val) => setForm((prev) => ({ ...prev, end_date: val }))}
            disabled={saving}
            placeholder="Pick end date"
          />
          {fieldErrors.end_date && (
            <p className="text-xs text-destructive">{fieldErrors.end_date}</p>
          )}
        </div>

      </div>

      {/* Error banner */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : initialData ? 'Save Changes' : 'Create Session'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </div>

    </form>
  )
}
