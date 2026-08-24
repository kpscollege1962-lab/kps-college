import { Check, Save, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/date-picker'
import { Can } from '@/casl/AbilityProvider'

export default function RegisterEntryRow({ level, levelLabel, row, saving, success, error, onChange, onSave, onDeleteRequest }) {
  return (
    <div className="space-y-1">
      <div className="grid grid-cols-1 sm:grid-cols-[9rem_1fr_11rem_10rem_1fr_5rem] gap-2 sm:gap-3 sm:items-center">

        <span className="text-sm font-medium sm:font-normal sm:text-muted-foreground">
          {levelLabel}
        </span>

        <Input
          value={row.admission_no}
          onChange={(e) => onChange('admission_no', e.target.value)}
          placeholder="Serial / Admission No"
          maxLength={50}
          disabled={saving}
        />

        <Input
          value={row.class_of_admission ?? ''}
          onChange={(e) => onChange('class_of_admission', e.target.value)}
          placeholder="Class of admission"
          maxLength={100}
          disabled={saving}
        />

        <DatePicker
          value={row.entry_date}
          onChange={(val) => onChange('entry_date', val ?? '')}
          disabled={saving}
          placeholder="Entry date"
          fromYear={1990}
          toYear={new Date().getFullYear() + 1}
        />

        <Input
          value={row.notes}
          onChange={(e) => onChange('notes', e.target.value)}
          placeholder="e.g. correction entry"
          maxLength={500}
          disabled={saving}
        />

        <Can I="update" a="Student">
          <div className="flex items-center gap-1.5">
            <Button
              size="icon"
              variant={success ? 'secondary' : 'default'}
              onClick={onSave}
              disabled={saving}
              aria-label={`Save ${levelLabel} register entry`}
            >
              {saving   ? <Loader2 className="h-4 w-4 animate-spin" />
               : success ? <Check   className="h-4 w-4" />
               : <Save className="h-4 w-4" />}
            </Button>
            {row.exists && (
              <Button
                size="icon"
                variant="ghost"
                onClick={onDeleteRequest}
                disabled={saving}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                aria-label={`Remove ${levelLabel} register entry`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </Can>

      </div>

      {error && <p className="text-xs text-destructive pl-1">{error}</p>}
    </div>
  )
}
