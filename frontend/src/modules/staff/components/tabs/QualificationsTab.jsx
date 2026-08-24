import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/date-picker'

function QualificationSection({ label, qualifications, type, handleQualificationChange, addQualification, removeQualification, fieldErrors, saving }) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">{label}</p>

      {/* Column headers — desktop only */}
      {qualifications.length > 0 && (
        <div className="hidden sm:grid grid-cols-[1fr_9rem_auto] gap-2 items-center px-1">
          <span className="text-xs font-medium text-muted-foreground">Title</span>
          <span className="text-xs font-medium text-muted-foreground">Completion</span>
          <span />
        </div>
      )}

      {qualifications.map((q, i) => (
        <div
          key={i}
          className="rounded-lg border p-3 space-y-2 sm:border-0 sm:p-0 sm:space-y-0 sm:grid sm:grid-cols-[1fr_9rem_auto] sm:gap-2 sm:items-center"
        >
          <Input
            value={q.title}
            onChange={(e) => handleQualificationChange(type, i, 'title', e.target.value)}
            placeholder={type === 'academic' ? 'e.g. BS Physics' : 'e.g. B.Ed, Teaching Certificate'}
            maxLength={200}
            disabled={saving}
          />
          <div className="sm:contents">
            <DatePicker
              value={q.completion_date}
              onChange={(val) => handleQualificationChange(type, i, 'completion_date', val ?? '')}
              disabled={saving}
              placeholder="Select a date"
              fromYear={1970}
              toYear={new Date().getFullYear()}
            />
          </div>
          <div className="flex justify-end sm:contents">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => removeQualification(type, i)}
              disabled={saving}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}

      {fieldErrors.qualifications && (
        <p className="text-xs text-destructive">{fieldErrors.qualifications}</p>
      )}

      <div className="flex justify-end">
        <Button type="button" size="icon" variant="outline" onClick={() => addQualification(type)} disabled={saving} className="h-8 w-8">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default function QualificationsTab({
  academicQualifications,
  professionalQualifications,
  handleQualificationChange,
  addQualification,
  removeQualification,
  fieldErrors,
  saving,
}) {
  return (
    <div className="space-y-6">

      <QualificationSection
        label="Academic"
        qualifications={academicQualifications}
        type="academic"
        handleQualificationChange={handleQualificationChange}
        addQualification={addQualification}
        removeQualification={removeQualification}
        fieldErrors={fieldErrors}
        saving={saving}
      />

      <div className="border-t border-border" />

      <QualificationSection
        label="Professional"
        qualifications={professionalQualifications}
        type="professional"
        handleQualificationChange={handleQualificationChange}
        addQualification={addQualification}
        removeQualification={removeQualification}
        fieldErrors={fieldErrors}
        saving={saving}
      />

    </div>
  )
}
