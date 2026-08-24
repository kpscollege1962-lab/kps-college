import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

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
