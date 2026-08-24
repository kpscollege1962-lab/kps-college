import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { DatePicker } from '@/components/ui/date-picker'
import StaffSearchCombobox from './StaffSearchCombobox'

export default function AddExistingStaffForm({
  campusId,
  onSubmit,
  onCancel,
  saving      = false,
  error       = null,
  fieldErrors = {},
}) {
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [form, setForm] = useState({
    employee_no:              '',
    joining_date:             '',
    is_timetable_eligible:    0,
    allow_concurrent_periods: 0,
  })
  const [localError, setLocalError] = useState(null)

  const handleSelect = (member) => {
    setSelectedStaff(member)
    setLocalError(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setLocalError(null)

    if (!selectedStaff) {
      setLocalError('Please select a staff member first.')
      return
    }

    const data = {
      isTimetableEligible:    form.is_timetable_eligible === 1,
      allowConcurrentPeriods: form.allow_concurrent_periods === 1,
    }
    if (form.employee_no.trim())  data.employee_no  = form.employee_no.trim()
    if (form.joining_date)        data.joining_date = form.joining_date

    onSubmit(selectedStaff.id, data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>

      {/* Search */}
      <div className="space-y-1.5">
        <Label>Staff Member <span className="text-destructive">*</span></Label>
        <StaffSearchCombobox
          campusId={campusId}
          value={selectedStaff}
          onChange={handleSelect}
          disabled={saving}
          error={fieldErrors.staffId}
        />
      </div>

      {/* Identity confirmation — shown once a staff member is selected */}
      {selectedStaff && (
        <>
          <Card className="bg-muted/40">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold">
                    {selectedStaff.gender === 'male'
                      ? 'Mr. '
                      : selectedStaff.gender === 'female'
                      ? 'Miss. '
                      : ''}
                    {selectedStaff.full_name}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {selectedStaff.cnic}
                  </p>
                </div>
                {selectedStaff.gender && (
                  <Badge variant="secondary" className="shrink-0">
                    {selectedStaff.gender === 'male' ? 'Male' : 'Female'}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Posting fields */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div className="space-y-1.5">
              <Label>Employee No</Label>
              <Input
                value={form.employee_no}
                onChange={(e) =>
                  setForm(prev => ({ ...prev, employee_no: e.target.value }))
                }
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
                onChange={(val) =>
                  setForm(prev => ({ ...prev, joining_date: val ?? '' }))
                }
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
        </>
      )}

      {(localError || error) && (
        <Alert variant="destructive">
          <AlertDescription>{localError ?? error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-2 pt-1">
        <Button type="submit" disabled={saving || !selectedStaff}>
          {saving ? 'Adding…' : 'Add to Campus'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </div>

    </form>
  )
}
