import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export default function ContactsTab({
  contacts,
  handleContactChange,
  handlePrimaryChange,
  addContact,
  removeContact,
  fieldErrors,
  saving,
}) {
  return (
    <div className="space-y-3">

      {/* Column headers — desktop only */}
      <div className="hidden sm:grid grid-cols-[7rem_1fr_1fr_auto_auto] gap-2 items-center px-1">
        <span className="text-xs font-medium text-muted-foreground">Label</span>
        <span className="text-xs font-medium text-muted-foreground">Name</span>
        <span className="text-xs font-medium text-muted-foreground">Phone</span>
        <span className="text-xs font-medium text-muted-foreground">Primary</span>
        <span />
      </div>

      <RadioGroup
        value={String(contacts.findIndex(c => c.is_primary === 1))}
        onValueChange={(val) => handlePrimaryChange(Number(val))}
      >
        {contacts.map((contact, i) => (
          <div
            key={i}
            className="rounded-lg border p-3 space-y-2 sm:border-0 sm:p-0 sm:space-y-0 sm:grid sm:grid-cols-[7rem_1fr_1fr_auto_auto] sm:gap-2 sm:items-center"
          >
            {/* Label + Name: stacked on mobile, separate grid cells on desktop */}
            <div className="grid grid-cols-1 gap-2 sm:contents">
              <Input
                value={contact.label}
                onChange={(e) => handleContactChange(i, 'label', e.target.value)}
                placeholder="e.g. Father"
                maxLength={50}
                disabled={saving}
              />
              <Input
                value={contact.name}
                onChange={(e) => handleContactChange(i, 'name', e.target.value)}
                placeholder="e.g. Muhammad Ali"
                maxLength={100}
                disabled={saving}
              />
            </div>

            {/* Phone: full width on mobile, 1fr cell on desktop */}
            <Input
              value={contact.phone}
              onChange={(e) => handleContactChange(i, 'phone', e.target.value)}
              placeholder="e.g. 03001234567"
              maxLength={20}
              disabled={saving}
            />

            {/* Primary + Remove: space-between row on mobile, separate grid cells on desktop */}
            <div className="flex items-center justify-between sm:contents">
              <div className="flex items-center gap-2 sm:justify-center">
                <span className="text-xs text-muted-foreground sm:hidden">Primary contact</span>
                <RadioGroupItem value={String(i)} />
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => removeContact(i)}
                disabled={saving || contacts.length === 1}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </RadioGroup>

      {contacts.map((_, i) => (
        (fieldErrors[`contacts[${i}].label`] || fieldErrors[`contacts[${i}].name`] || fieldErrors[`contacts[${i}].phone`]) && (
          <div key={`err-${i}`} className="text-xs text-destructive space-y-0.5">
            {fieldErrors[`contacts[${i}].label`] && <p>{fieldErrors[`contacts[${i}].label`]}</p>}
            {fieldErrors[`contacts[${i}].name`]  && <p>{fieldErrors[`contacts[${i}].name`]}</p>}
            {fieldErrors[`contacts[${i}].phone`] && <p>{fieldErrors[`contacts[${i}].phone`]}</p>}
          </div>
        )
      ))}

      {fieldErrors.contacts && (
        <p className="text-xs text-destructive">{fieldErrors.contacts}</p>
      )}

      {/* Add button — right-aligned on both breakpoints */}
      <div className="flex justify-end">
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={addContact}
          disabled={saving}
          className="h-8 w-8"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

    </div>
  )
}
