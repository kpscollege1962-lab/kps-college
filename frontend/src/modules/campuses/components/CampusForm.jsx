import { useState, useRef } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useCampusBranding } from '../hooks/useCampusBranding'

// Radix <Select.Item> can't have an empty-string value, so "None" uses 'none'
// in the UI and is stored as null in the DB.
const TITLE_VARIANTS = [
  { value: 'none',     label: 'None' },
  { value: 'english',  label: 'English Title' },
  { value: 'urdu',     label: 'Urdu Title' },
  { value: 'combined', label: 'Urdu + English Title' },
]

const SLOTS = [
  { key: 'title_english',  label: 'Title (English)' },
  { key: 'title_urdu',     label: 'Title (Urdu)' },
  { key: 'title_combined', label: 'Title (Urdu + English)' },
  { key: 'watermark',      label: 'Watermark' },
]

// The backend serves /uploads from its own origin. In dev that is not the Vite
// origin, so set VITE_API_ORIGIN=http://localhost:<backend-port> in frontend/.env
// (or proxy /uploads in vite.config.js and leave the variable unset).
const assetUrl = (p) =>
  !p ? null : /^https?:\/\//i.test(p) ? p : `${import.meta.env.VITE_API_ORIGIN ?? ''}${p}`

// One upload slot — thumbnail if an image exists, otherwise an "Upload" button.
const BrandingImageSlot = ({ label, imageUrl, uploading, onUpload, onClear, disabled }) => {
  const inputRef = useRef(null)

  const handleChange = (e) => {
    const file = e.target.files?.[0]
    if (file) onUpload(file)
    e.target.value = ''
  }

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="border border-border rounded-lg p-2 flex items-center gap-3">
        {imageUrl ? (
          <img src={imageUrl} alt={label} className="h-12 max-w-[140px] object-contain rounded" />
        ) : (
          <div className="h-12 w-[140px] flex items-center justify-center text-[10px] text-muted-foreground bg-muted rounded">
            No image
          </div>
        )}
        <div className="flex items-center gap-1.5 ml-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || uploading}
            className="gap-1.5"
          >
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            {imageUrl ? 'Replace' : 'Upload'}
          </Button>
          {imageUrl && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onClear}
              disabled={disabled || uploading}
              title={`Remove ${label.toLowerCase()}`}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleChange}
        />
      </div>
    </div>
  )
}

// Only rendered when editing an existing campus (uploads need a real campus id).
// Images upload immediately; the active title is saved by the form's own submit.
const CampusBrandingSection = ({ campus, variant, onVariantChange }) => {
  const { branding, busyField, error, upload, clear } = useCampusBranding(campus.id, campus)

  return (
    <div className="space-y-4 border-t border-border pt-6">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Printed Timetable Branding</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Images upload immediately. The active title is saved with the form's Save Changes.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SLOTS.map(({ key, label }) => (
          <BrandingImageSlot
            key={key}
            label={label}
            imageUrl={assetUrl(branding[`${key}_url`])}
            uploading={busyField === key}
            disabled={!!busyField}
            onUpload={(file) => upload(key, file)}
            onClear={() => clear(key)}
          />
        ))}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5 sm:max-w-xs">
        <Label>Active Title on Printed Timetables</Label>
        <Select
          value={variant || 'none'}
          onValueChange={(v) => onVariantChange(v === 'none' ? '' : v)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="None" />
          </SelectTrigger>
          <SelectContent>
            {TITLE_VARIANTS.map((v) => (
              <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Choose which uploaded title shows on the printed timetable header. Selecting a
          variant that hasn't been uploaded yet will show nothing until you upload it.
        </p>
      </div>
    </div>
  )
}

export default function CampusForm({ initialData = null, onSubmit, onCancel, saving = false, error = null, fieldErrors = {} }) {
  const [form, setForm] = useState({
    name:      initialData?.name      ?? '',
    code:      initialData?.code      ?? '',
    address:   initialData?.address   ?? '',
    phone:     initialData?.phone     ?? '',
    email:     initialData?.email     ?? '',
    is_active: initialData?.is_active ?? 1,
    active_title_variant: initialData?.active_title_variant ?? '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      name:      form.name.trim(),
      code:      form.code.trim(),
      address:   form.address.trim(),
      phone:     form.phone.trim(),
      email:     form.email.trim(),
      is_active: form.is_active,
      // only sent when editing an existing campus
      ...(initialData?.id && { active_title_variant: form.active_title_variant || null }),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

        {/* Name */}
        <div className="space-y-1.5">
          <Label>Campus Name <span className="text-destructive">*</span></Label>
          <Input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Main Campus"
            required
            disabled={saving}
          />
          {fieldErrors.name && (
            <p className="text-xs text-destructive">{fieldErrors.name}</p>
          )}
        </div>

        {/* Code */}
        <div className="space-y-1.5">
          <Label>Code</Label>
          <Input
            name="code"
            value={form.code}
            onChange={handleChange}
            placeholder="e.g. CAMP-A"
            disabled={saving}
          />
          {fieldErrors.code && (
            <p className="text-xs text-destructive">{fieldErrors.code}</p>
          )}
        </div>

        {/* Address */}
        <div className="space-y-1.5">
          <Label>Address</Label>
          <Input
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Street, City"
            disabled={saving}
          />
          {fieldErrors.address && (
            <p className="text-xs text-destructive">{fieldErrors.address}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <Label>Phone</Label>
          <Input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+92 300 0000000"
            disabled={saving}
          />
          {fieldErrors.phone && (
            <p className="text-xs text-destructive">{fieldErrors.phone}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="campus@school.edu"
            disabled={saving}
          />
          {fieldErrors.email && (
            <p className="text-xs text-destructive">{fieldErrors.email}</p>
          )}
        </div>

        {/* Status toggle */}
        <div className="space-y-1.5">
          <Label>Status</Label>
          <div className="flex">
            <Button
              type="button"
              variant={form.is_active === 1 ? 'default' : 'outline'}
              size="sm"
              onClick={() => setForm((prev) => ({ ...prev, is_active: 1 }))}
              disabled={saving}
              className="rounded-r-none"
            >
              Active
            </Button>
            <Button
              type="button"
              variant={form.is_active === 0 ? 'destructive' : 'outline'}
              size="sm"
              onClick={() => setForm((prev) => ({ ...prev, is_active: 0 }))}
              disabled={saving}
              className="rounded-l-none border-l-0"
            >
              Inactive
            </Button>
          </div>
        </div>

      </div>

      {/* Branding only makes sense for a campus that already exists */}
      {initialData?.id && (
        <CampusBrandingSection
          campus={initialData}
          variant={form.active_title_variant}
          onVariantChange={(v) => setForm((prev) => ({ ...prev, active_title_variant: v }))}
        />
      )}

      {/* Error banner */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : initialData ? 'Save Changes' : 'Create Campus'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </div>

    </form>
  )
}