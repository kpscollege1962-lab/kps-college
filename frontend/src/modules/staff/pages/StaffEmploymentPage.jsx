import { useState } from 'react'
import { useParams, useOutletContext } from 'react-router'
import { useRoleContext } from '@/modules/auth/hooks/useRoleContext'
import { Pencil } from 'lucide-react'
import { updateStaffPostingService } from '../services/staff.service'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Can } from '@/casl/AbilityProvider'
import { formatDate } from '@/lib/dateUtils'
import { Field } from '../components/StaffField'

export default function StaffEmploymentPage() {
  const { staffId }    = useParams()
  const { activeRole } = useRoleContext()
  const { staff, fetchStaff } = useOutletContext()

  const posting = staff.postings?.[0]

  const [editing,         setEditing]         = useState(false)
  const [saving,          setSaving]          = useState(false)
  const [formError,       setFormError]       = useState(null)
  const [formFieldErrors, setFormFieldErrors] = useState({})

  const [form, setForm] = useState({
    employee_no:              posting?.employee_no              ?? '',
    joining_date:             posting?.joining_date             ?? '',
    is_active:                posting?.is_active                ?? 1,
    is_timetable_eligible:    posting?.is_timetable_eligible    ?? 0,
    allow_concurrent_periods: posting?.allow_concurrent_periods ?? 0,
  })

  const handleEdit = () => {
    // Re-sync form from current posting before opening edit mode
    setForm({
      employee_no:              posting?.employee_no              ?? '',
      joining_date:             posting?.joining_date             ?? '',
      is_active:                posting?.is_active                ?? 1,
      is_timetable_eligible:    posting?.is_timetable_eligible    ?? 0,
      allow_concurrent_periods: posting?.allow_concurrent_periods ?? 0,
    })
    setFormError(null)
    setFormFieldErrors({})
    setEditing(true)
  }

  const handleCancel = () => {
    setEditing(false)
    setFormError(null)
    setFormFieldErrors({})
  }

  const handleSave = async () => {
    setSaving(true)
    setFormError(null)

    const payload = {
      is_active:              form.is_active,
      isTimetableEligible:    form.is_timetable_eligible === 1,
      allowConcurrentPeriods: form.allow_concurrent_periods === 1,
    }
    if (form.employee_no.trim())  payload.employee_no  = form.employee_no.trim()
    if (form.joining_date)        payload.joining_date = form.joining_date

    const result = await updateStaffPostingService(
      activeRole.campusId,
      parseInt(staffId),
      payload
    )

    setSaving(false)

    if (result.success) {
      setEditing(false)
      fetchStaff()
    } else {
      setFormError(result.message)
      const fe = result.data?.errors?.fieldErrors ?? result.data?.fieldErrors ?? {}
      setFormFieldErrors(fe)
    }
  }

  return (
    <div className="space-y-4">

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Employment</CardTitle>
            {!editing && (
              <Can I="update" a="Staff">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleEdit}
                  aria-label="Edit employment details"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </Can>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">

          {!editing ? (
            // ── Display mode ──────────────────────────────────────────────────
            <div className="grid grid-cols-2 gap-4">
              <Field label="Employee No"  value={posting?.employee_no} />
              <Field label="Joining Date" value={formatDate(posting?.joining_date)} />
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Status</p>
                <Badge
                  variant={posting?.is_active ? 'default' : 'secondary'}
                  className={posting?.is_active
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0'
                    : ''}
                >
                  {posting?.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Available for Timetable</p>
                <Badge
                  variant={posting?.is_timetable_eligible ? 'default' : 'secondary'}
                  className={posting?.is_timetable_eligible
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0'
                    : ''}
                >
                  {posting?.is_timetable_eligible ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Allow Concurrent Periods</p>
                <Badge
                  variant={posting?.allow_concurrent_periods ? 'default' : 'secondary'}
                  className={posting?.allow_concurrent_periods
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-0'
                    : ''}
                >
                  {posting?.allow_concurrent_periods ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
          ) : (
            // ── Edit mode ─────────────────────────────────────────────────────
            <div className="space-y-4">

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div className="space-y-1.5">
                  <Label>Employee No</Label>
                  <Input
                    value={form.employee_no}
                    onChange={(e) => setForm(prev => ({ ...prev, employee_no: e.target.value }))}
                    placeholder="e.g. EMP-001"
                    disabled={saving}
                  />
                  {formFieldErrors.employee_no && (
                    <p className="text-xs text-destructive">{formFieldErrors.employee_no}</p>
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
                  {formFieldErrors.joining_date && (
                    <p className="text-xs text-destructive">{formFieldErrors.joining_date}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label>Active</Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={form.is_active === 1}
                      onCheckedChange={(checked) =>
                        setForm(prev => ({ ...prev, is_active: checked ? 1 : 0 }))
                      }
                      disabled={saving}
                    />
                    <span className="text-sm text-muted-foreground">
                      {form.is_active === 1 ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
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

              {formError && (
                <Alert variant="destructive">
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}

              <div className="flex items-center gap-2">
                <Button onClick={handleSave} disabled={saving} size="sm">
                  {saving ? 'Saving…' : 'Save Changes'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saving}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>

            </div>
          )}

        </CardContent>
      </Card>

    </div>
  )
}
