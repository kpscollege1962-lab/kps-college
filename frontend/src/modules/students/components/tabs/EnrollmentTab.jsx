import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

export default function EnrollmentTab({ enrollment, admissionNo, onChange, fieldErrors, saving }) {
  const {
    activeSession,
    campuses, campusesLoading, campusesError, enrollCampusId, setEnrollCampusId,
    classes,  classesLoading,  classesError,  enrollClassId,  setEnrollClassId,
    sections, enrollSectionId, setEnrollSectionId,
  } = enrollment

  const anyError = campusesError || classesError

  return (
    <div className="space-y-4">

      {/* Session awareness banner */}
      <div className="rounded-lg border border-border bg-muted/40 px-4 py-3">
        <p className="text-xs text-muted-foreground">
          Enrolling into session:{' '}
          <span className="font-medium text-foreground">
            {activeSession?.name ?? '—'}
          </span>
          {activeSession && activeSession.status !== 'active' && activeSession.status !== 'upcoming' && (
            <span className="ml-2 text-destructive">(this session is {activeSession.status})</span>
          )}
        </p>
      </div>

      {anyError && (
        <Alert variant="destructive">
          <AlertDescription>
            {anyError} — close and reopen this form to retry.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

        {/* Campus */}
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Campus <span className="text-destructive">*</span></Label>
          <Select
            value={enrollCampusId ? String(enrollCampusId) : ''}
            onValueChange={(val) => setEnrollCampusId(parseInt(val))}
            disabled={campusesLoading || saving}
          >
            <SelectTrigger className="w-full">
              <span className={cn('flex flex-1 text-left text-sm', !enrollCampusId && 'text-muted-foreground')}>
                {campusesLoading
                  ? 'Loading campuses…'
                  : campuses.find(c => c.id === enrollCampusId)?.name ?? 'Select a campus'}
              </span>
            </SelectTrigger>
            <SelectContent>
              {campuses.map(c => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldErrors.campusId && (
            <p className="text-xs text-destructive">{fieldErrors.campusId}</p>
          )}
        </div>

        {/* Class — disabled until campus is selected */}
        <div className="space-y-1.5">
          <Label>Class <span className="text-destructive">*</span></Label>
          <Select
            value={enrollClassId ? String(enrollClassId) : ''}
            onValueChange={(val) => setEnrollClassId(parseInt(val))}
            disabled={!enrollCampusId || classesLoading || saving}
          >
            <SelectTrigger className="w-full">
              <span className={cn('flex flex-1 text-left text-sm', !enrollClassId && 'text-muted-foreground')}>
                {!enrollCampusId
                  ? 'Select a campus first'
                  : classesLoading
                    ? 'Loading…'
                    : classes.find(c => c.id === enrollClassId)?.name ?? 'Select a class'}
              </span>
            </SelectTrigger>
            <SelectContent>
              {classes.map(c => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldErrors.classGroupId && (
            <p className="text-xs text-destructive">{fieldErrors.classGroupId}</p>
          )}
        </div>

        {/* Section — shown once a class is selected; disabled if class is unsectioned */}
        <div className="space-y-1.5">
          <Label>
            Section{sections.length > 0 && <span className="text-destructive"> *</span>}
          </Label>
          <Select
            value={enrollSectionId}
            onValueChange={setEnrollSectionId}
            disabled={!enrollClassId || sections.length === 0 || saving}
          >
            <SelectTrigger className="w-full">
              <span className={cn('flex flex-1 text-left text-sm', !enrollSectionId && 'text-muted-foreground')}>
                {!enrollClassId
                  ? 'Select a class first'
                  : sections.length === 0
                    ? 'No sections'
                    : sections.find(s => String(s.id) === enrollSectionId)?.name ?? 'Select a section'}
              </span>
            </SelectTrigger>
            <SelectContent>
              {sections.map(s => (
                <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldErrors.sectionId && (
            <p className="text-xs text-destructive">{fieldErrors.sectionId}</p>
          )}
        </div>

        {/* Ad/W Register Number */}
        <div className="space-y-1.5 sm:col-span-2">
          <div className="flex items-baseline gap-2">
            <Label>Ad/W Reg #</Label>
            <span className="text-xs text-muted-foreground">(Admission number on the physical register)</span>
          </div>
          <Input
            name="admission_no"
            value={admissionNo}
            onChange={onChange}
            placeholder="e.g. 42"
            maxLength={50}
            disabled={saving}
          />
          {fieldErrors.admission_no && (
            <p className="text-xs text-destructive">{fieldErrors.admission_no}</p>
          )}
        </div>

      </div>
    </div>
  )
}
