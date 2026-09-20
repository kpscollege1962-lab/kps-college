import { useState, useEffect, useRef } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useCampusSettings } from '@/modules/campus-settings/hooks/useCampusSettings'

const TITLE_VARIANTS = [
  { value: 'english',  label: 'English Title' },
  { value: 'urdu',      label: 'Urdu Title' },
  { value: 'combined',  label: 'Urdu + English Title' },
]

// One upload slot — shows a thumbnail if an image is already set, otherwise
// an "Upload" button; a small × removes it (by patching the field to null
// through the normal settings update, not a separate delete endpoint).
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
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
      </div>
    </div>
  )
}

// Shown only when editing an existing campus (needs a real campus id to
// attach uploads to). Manages its own fetch/save cycle against the
// campus-settings module — separate from the campus name/code/etc. fields
// above it, which save through the parent CampusForm's own submit.
const CampusBrandingSection = ({ campusId }) => {
  const {
    settings, loading, saving, saveError, uploadingField, uploadError,
    fetchSettings, updateSettings, uploadBrandingImage,
  } = useCampusSettings()

  const [variant, setVariant] = useState('')
  const [variantDirty, setVariantDirty] = useState(false)

  useEffect(() => {
    fetchSettings(campusId)
  }, [campusId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (settings?.raw) {
      setVariant(settings.raw.active_title_variant ?? '')
      setVariantDirty(false)
    }
  }, [settings])

  const handleUploadImage = (field, file) => uploadBrandingImage(campusId, field, file)

  const handleClearImage = async (field) => {
    const result = await updateSettings(campusId, { [field]: null })
    if (result.success) fetchSettings(campusId)
  }

  const handleVariantSelect = (value) => {
    setVariant(value)
    setVariantDirty(true)
  }

  const handleSaveVariant = async () => {
    const result = await updateSettings(campusId, { active_title_variant: variant })
    if (result.success) {
      setVariantDirty(false)
      fetchSettings(campusId)
    }
  }

  const resolved = settings?.resolved ?? {}

  if (loading && !settings) {
    return <p className="text-xs text-muted-foreground">Loading branding settings…</p>
  }

  return (
    <div className="space-y-4 border-t border-border pt-6">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Printed Timetable Branding</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Upload a title banner and watermark once here — they're applied automatically
          on this campus's Timetable Preview print output.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <BrandingImageSlot
          label="Title (English)"
          imageUrl={resolved.title_english_url}
          uploading={uploadingField === 'title_english_url'}
          onUpload={(file) => handleUploadImage('title_english_url', file)}
          onClear={() => handleClearImage('title_english_url')}
        />
        <BrandingImageSlot
          label="Title (Urdu)"
          imageUrl={resolved.title_urdu_url}
          uploading={uploadingField === 'title_urdu_url'}
          onUpload={(file) => handleUploadImage('title_urdu_url', file)}
          onClear={() => handleClearImage('title_urdu_url')}
        />
        <BrandingImageSlot
          label="Title (Urdu + English)"
          imageUrl={resolved.title_combined_url}
          uploading={uploadingField === 'title_combined_url'}
          onUpload={(file) => handleUploadImage('title_combined_url', file)}
          onClear={() => handleClearImage('title_combined_url')}
        />
        <BrandingImageSlot
          label="Watermark"
          imageUrl={resolved.watermark_url}
          uploading={uploadingField === 'watermark_url'}
          onUpload={(file) => handleUploadImage('watermark_url', file)}
          onClear={() => handleClearImage('watermark_url')}
        />
      </div>

      {uploadError && (
        <Alert variant="destructive">
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5 sm:max-w-xs">
        <Label>Active Title on Printed Timetables</Label>
        <Select value={variant} onValueChange={handleVariantSelect}>
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

      {saveError && (
        <Alert variant="destructive">
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
      )}

      <div>
        <Button type="button" onClick={handleSaveVariant} disabled={!variantDirty || saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </Button>
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
      {initialData?.id && <CampusBrandingSection campusId={initialData.id} />}

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