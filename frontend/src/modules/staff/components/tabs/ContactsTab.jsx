import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'

export default function ContactsTab({
  form,
  setForm,
  phones,
  handlePhoneChange,
  handlePhonePrimaryChange,
  addPhone,
  removePhone,
  fieldErrors,
  saving,
}) {
  return (
    <div className="space-y-4">

      {/* Email */}
      <div className="space-y-1.5">
        <Label>Email</Label>
        <Input
          type="email"
          value={form.email}
          onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
          placeholder="e.g. ahmed@school.edu.pk"
          disabled={saving}
        />
        {fieldErrors.email && (
          <p className="text-xs text-destructive">{fieldErrors.email}</p>
        )}
      </div>

      <Separator />

      {/* Phones */}
      <div className="space-y-3">

        {/* Column headers — desktop only */}
        <div className="hidden sm:grid grid-cols-[8rem_1fr_auto_auto] gap-2 items-center px-1">
          <span className="text-xs font-medium text-muted-foreground">Label</span>
          <span className="text-xs font-medium text-muted-foreground">Phone</span>
          <span className="text-xs font-medium text-muted-foreground">Primary</span>
          <span />
        </div>

        <RadioGroup
          value={String(phones.findIndex(p => p.is_primary === 1))}
          onValueChange={(val) => handlePhonePrimaryChange(Number(val))}
        >
          {phones.map((phone, i) => (
            <div
              key={i}
              className="rounded-lg border p-3 space-y-2 sm:border-0 sm:p-0 sm:space-y-0 sm:grid sm:grid-cols-[8rem_1fr_auto_auto] sm:gap-2 sm:items-center"
            >
              {/* Label + Phone: stacked on mobile, separate grid cells on desktop */}
              <div className="grid grid-cols-1 gap-2 sm:contents">
                <Input
                  value={phone.label}
                  onChange={(e) => handlePhoneChange(i, 'label', e.target.value)}
                  placeholder="e.g. Personal"
                  maxLength={50}
                  disabled={saving}
                />
                <Input
                  value={phone.phone}
                  onChange={(e) => handlePhoneChange(i, 'phone', e.target.value)}
                  placeholder="e.g. 03001234567"
                  maxLength={20}
                  disabled={saving}
                />
              </div>

              {/* Primary + Remove: space-between row on mobile, separate grid cells on desktop */}
              <div className="flex items-center justify-between sm:contents">
                <div className="flex items-center gap-2 sm:justify-center">
                  <span className="text-xs text-muted-foreground sm:hidden">Primary number</span>
                  <RadioGroupItem value={String(i)} />
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => removePhone(i)}
                  disabled={saving || phones.length === 1}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </RadioGroup>

        {phones.map((_, i) => (
          fieldErrors[`phones[${i}].phone`] && (
            <p key={`perr-${i}`} className="text-xs text-destructive">{fieldErrors[`phones[${i}].phone`]}</p>
          )
        ))}

        {fieldErrors.phones && <p className="text-xs text-destructive">{fieldErrors.phones}</p>}

        {/* Add button — right-aligned */}
        <div className="flex justify-end">
          <Button type="button" size="icon" variant="outline" onClick={addPhone} disabled={saving} className="h-8 w-8">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

      </div>

    </div>
  )
}
