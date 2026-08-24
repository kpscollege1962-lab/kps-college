import { useState, useEffect } from 'react'
import { useAbility } from '@casl/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AbilityContext, Can } from '@/casl/AbilityProvider'

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

const emptyForm = {
  school_name:               '',
  short_name:                '',
  tagline:                   '',
  registration_no:           '',
  school_type:               '',
  email:                     '',
  phone:                     '',
  website:                   '',
  address:                   '',
  city:                      '',
  state_province:            '',
  country:                   '',
  postal_code:               '',
  timezone:                  '',
  date_format:               '',
  currency_code:             '',
  currency_symbol:           '',
  currency_position:         'before',
  academic_year_start_month: '',
  default_pass_percentage:   '',
  min_attendance_percentage: '',
}

const fromData = (data) => ({
  school_name:               data?.school_name               ?? '',
  short_name:                data?.short_name                ?? '',
  tagline:                   data?.tagline                   ?? '',
  registration_no:           data?.registration_no           ?? '',
  school_type:               data?.school_type               ?? '',
  email:                     data?.email                     ?? '',
  phone:                     data?.phone                     ?? '',
  website:                   data?.website                   ?? '',
  address:                   data?.address                   ?? '',
  city:                      data?.city                      ?? '',
  state_province:            data?.state_province            ?? '',
  country:                   data?.country                   ?? '',
  postal_code:               data?.postal_code               ?? '',
  timezone:                  data?.timezone                  ?? '',
  date_format:               data?.date_format               ?? '',
  currency_code:             data?.currency_code             ?? '',
  currency_symbol:           data?.currency_symbol           ?? '',
  currency_position:         data?.currency_position         ?? 'before',
  academic_year_start_month: data?.academic_year_start_month != null ? String(data.academic_year_start_month) : '',
  default_pass_percentage:   data?.default_pass_percentage   != null ? String(data.default_pass_percentage)   : '',
  min_attendance_percentage: data?.min_attendance_percentage != null ? String(data.min_attendance_percentage) : '',
})

export default function SchoolSettingsForm({ initialData = null, onSubmit, saving = false, error = null, fieldErrors = {} }) {
  const ability     = useAbility(AbilityContext)
  const canUpdate   = ability.can('update', 'SchoolSettings')

  const [form, setForm] = useState(() => fromData(initialData))

  useEffect(() => {
    setForm(fromData(initialData))
  }, [initialData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelect = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>

      {/* ── Section 1: School Identity ─────────────────────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">School Identity</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          {/* School Name */}
          <div className="space-y-1.5">
            <Label>School Name <span className="text-destructive">*</span></Label>
            <Input
              name="school_name"
              value={form.school_name}
              onChange={handleChange}
              disabled={saving || !canUpdate}
            />
            {fieldErrors.school_name && (
              <p className="text-xs text-destructive">{fieldErrors.school_name}</p>
            )}
          </div>

          {/* Short Name */}
          <div className="space-y-1.5">
            <Label>Short Name</Label>
            <Input
              name="short_name"
              value={form.short_name}
              onChange={handleChange}
              disabled={saving || !canUpdate}
            />
            {fieldErrors.short_name && (
              <p className="text-xs text-destructive">{fieldErrors.short_name}</p>
            )}
          </div>

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

          {/* Registration No. */}
          <div className="space-y-1.5">
            <Label>Registration No.</Label>
            <Input
              name="registration_no"
              value={form.registration_no}
              onChange={handleChange}
              disabled={saving || !canUpdate}
            />
            {fieldErrors.registration_no && (
              <p className="text-xs text-destructive">{fieldErrors.registration_no}</p>
            )}
          </div>

          {/* School Type */}
          <div className="space-y-1.5">
            <Label>School Type</Label>
            <Select
              value={form.school_type || undefined}
              onValueChange={(val) => handleSelect('school_type', val)}
              disabled={saving || !canUpdate}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="government">Government</SelectItem>
                <SelectItem value="semi_government">Semi-Government</SelectItem>
              </SelectContent>
            </Select>
            {fieldErrors.school_type && (
              <p className="text-xs text-destructive">{fieldErrors.school_type}</p>
            )}
          </div>

        </div>
      </div>

      {/* ── Section 2: Contact Information ────────────────────────────────── */}
      <div className="space-y-4 border-t border-border pt-6">
        <h2 className="text-sm font-semibold text-foreground">Contact Information</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          {/* Email */}
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              disabled={saving || !canUpdate}
            />
            {fieldErrors.email && (
              <p className="text-xs text-destructive">{fieldErrors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              disabled={saving || !canUpdate}
            />
            {fieldErrors.phone && (
              <p className="text-xs text-destructive">{fieldErrors.phone}</p>
            )}
          </div>

          {/* Website */}
          <div className="space-y-1.5">
            <Label>Website</Label>
            <Input
              type="url"
              name="website"
              value={form.website}
              onChange={handleChange}
              disabled={saving || !canUpdate}
            />
            {fieldErrors.website && (
              <p className="text-xs text-destructive">{fieldErrors.website}</p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <Label>Address</Label>
            <Input
              name="address"
              value={form.address}
              onChange={handleChange}
              disabled={saving || !canUpdate}
            />
            {fieldErrors.address && (
              <p className="text-xs text-destructive">{fieldErrors.address}</p>
            )}
          </div>

          {/* City */}
          <div className="space-y-1.5">
            <Label>City</Label>
            <Input
              name="city"
              value={form.city}
              onChange={handleChange}
              disabled={saving || !canUpdate}
            />
            {fieldErrors.city && (
              <p className="text-xs text-destructive">{fieldErrors.city}</p>
            )}
          </div>

          {/* State / Province */}
          <div className="space-y-1.5">
            <Label>State / Province</Label>
            <Input
              name="state_province"
              value={form.state_province}
              onChange={handleChange}
              disabled={saving || !canUpdate}
            />
            {fieldErrors.state_province && (
              <p className="text-xs text-destructive">{fieldErrors.state_province}</p>
            )}
          </div>

          {/* Country */}
          <div className="space-y-1.5">
            <Label>Country</Label>
            <Input
              name="country"
              value={form.country}
              onChange={handleChange}
              disabled={saving || !canUpdate}
            />
            {fieldErrors.country && (
              <p className="text-xs text-destructive">{fieldErrors.country}</p>
            )}
          </div>

          {/* Postal Code */}
          <div className="space-y-1.5">
            <Label>Postal Code</Label>
            <Input
              name="postal_code"
              value={form.postal_code}
              onChange={handleChange}
              disabled={saving || !canUpdate}
            />
            {fieldErrors.postal_code && (
              <p className="text-xs text-destructive">{fieldErrors.postal_code}</p>
            )}
          </div>

        </div>
      </div>

      {/* ── Section 3: Localization ───────────────────────────────────────── */}
      <div className="space-y-4 border-t border-border pt-6">
        <h2 className="text-sm font-semibold text-foreground">Localization</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          {/* Timezone */}
          <div className="space-y-1.5">
            <Label>Timezone</Label>
            <Input
              name="timezone"
              value={form.timezone}
              onChange={handleChange}
              placeholder="e.g. Asia/Karachi"
              disabled={saving || !canUpdate}
            />
            {fieldErrors.timezone && (
              <p className="text-xs text-destructive">{fieldErrors.timezone}</p>
            )}
          </div>

          {/* Date Format */}
          <div className="space-y-1.5">
            <Label>Date Format</Label>
            <Select
              value={form.date_format || undefined}
              onValueChange={(val) => handleSelect('date_format', val)}
              disabled={saving || !canUpdate}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
            {fieldErrors.date_format && (
              <p className="text-xs text-destructive">{fieldErrors.date_format}</p>
            )}
          </div>

          {/* Currency Code */}
          <div className="space-y-1.5">
            <Label>Currency Code</Label>
            <Input
              name="currency_code"
              value={form.currency_code}
              onChange={handleChange}
              placeholder="e.g. PKR"
              disabled={saving || !canUpdate}
            />
            {fieldErrors.currency_code && (
              <p className="text-xs text-destructive">{fieldErrors.currency_code}</p>
            )}
          </div>

          {/* Currency Symbol */}
          <div className="space-y-1.5">
            <Label>Currency Symbol</Label>
            <Input
              name="currency_symbol"
              value={form.currency_symbol}
              onChange={handleChange}
              placeholder="e.g. ₨"
              disabled={saving || !canUpdate}
            />
            {fieldErrors.currency_symbol && (
              <p className="text-xs text-destructive">{fieldErrors.currency_symbol}</p>
            )}
          </div>

          {/* Currency Position */}
          <div className="space-y-1.5">
            <Label>Symbol Position</Label>
            <div className="flex">
              <Button
                type="button"
                variant={form.currency_position === 'before' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setForm((prev) => ({ ...prev, currency_position: 'before' }))}
                disabled={saving || !canUpdate}
                className="rounded-r-none"
              >
                Before
              </Button>
              <Button
                type="button"
                variant={form.currency_position === 'after' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setForm((prev) => ({ ...prev, currency_position: 'after' }))}
                disabled={saving || !canUpdate}
                className="rounded-l-none border-l-0"
              >
                After
              </Button>
            </div>
            {fieldErrors.currency_position && (
              <p className="text-xs text-destructive">{fieldErrors.currency_position}</p>
            )}
          </div>

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
            {fieldErrors.academic_year_start_month && (
              <p className="text-xs text-destructive">{fieldErrors.academic_year_start_month}</p>
            )}
          </div>

        </div>
      </div>

      {/* ── Section 4: Academic Defaults ─────────────────────────────────── */}
      <div className="space-y-4 border-t border-border pt-6">
        <h2 className="text-sm font-semibold text-foreground">Academic Defaults</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

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
            {fieldErrors.default_pass_percentage && (
              <p className="text-xs text-destructive">{fieldErrors.default_pass_percentage}</p>
            )}
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
            {fieldErrors.min_attendance_percentage && (
              <p className="text-xs text-destructive">{fieldErrors.min_attendance_percentage}</p>
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
      <Can I="update" a="SchoolSettings">
        <div className="flex items-center gap-2 pt-1">
          <Button type="submit" disabled={saving || !canUpdate}>
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </Can>

    </form>
  )
}
