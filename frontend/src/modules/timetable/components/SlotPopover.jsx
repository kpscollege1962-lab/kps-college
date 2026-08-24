import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'

export default function SlotPopover({ slot, subjects, staffList, onSubmit, onClear, saving }) {
  const [subjectId1, setSubjectId1] = useState(slot?.subject_id_1 ? String(slot.subject_id_1) : '')
  const [subjectId2, setSubjectId2] = useState(slot?.subject_id_2 ? String(slot.subject_id_2) : '')
  const [staffId1, setStaffId1]     = useState(slot?.staff_id_1   ? String(slot.staff_id_1)   : '')
  const [staffId2, setStaffId2]     = useState(slot?.staff_id_2   ? String(slot.staff_id_2)   : '')
  const [label, setLabel]           = useState(slot?.label ?? '')

  const hasContent = slot && (slot.subject_id_1 || slot.staff_id_1 || slot.staff_id_2 || slot.label)

  const selectedSubject1 = subjects.find((s) => String(s.id) === subjectId1)
  const selectedSubject2 = subjects.find((s) => String(s.id) === subjectId2)
  const selectedStaff1   = staffList.find((s) => String(s.id) === staffId1)
  const selectedStaff2   = staffList.find((s) => String(s.id) === staffId2)

  const handleSave = () => {
    onSubmit({
      label:      label || null,
      subjectId1: subjectId1 ? parseInt(subjectId1) : null,
      subjectId2: subjectId2 ? parseInt(subjectId2) : null,
      staffId1:   staffId1   ? parseInt(staffId1)   : null,
      staffId2:   staffId2   ? parseInt(staffId2)   : null,
    })
  }

  return (
    <div className="space-y-2 min-w-[200px]">
      {/* Primary */}
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground font-medium">Primary Subject</p>
        <Select value={subjectId1} onValueChange={(v) => { setSubjectId1(v); if (!v) setSubjectId2('') }}>
          <SelectTrigger className="h-7 text-xs">
            <SelectValue placeholder="None">
              {selectedSubject1 ? selectedSubject1.name : undefined}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground font-medium pt-1">Teacher</p>
        <Select value={staffId1} onValueChange={setStaffId1}>
          <SelectTrigger className="h-7 text-xs">
            <SelectValue placeholder="None">
              {selectedStaff1 ? selectedStaff1.full_name : undefined}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            {staffList.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>{s.full_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Alternate */}
      <div className="space-y-1 pt-1 border-t border-border">
        <p className="text-xs text-muted-foreground font-medium pt-1">Alternate Subject</p>
        <Select value={subjectId2} onValueChange={setSubjectId2} disabled={!subjectId1}>
          <SelectTrigger className="h-7 text-xs">
            <SelectValue placeholder="None">
              {selectedSubject2 ? selectedSubject2.name : undefined}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground font-medium pt-1">Teacher</p>
        <Select value={staffId2} onValueChange={setStaffId2}>
          <SelectTrigger className="h-7 text-xs">
            <SelectValue placeholder="None">
              {selectedStaff2 ? selectedStaff2.full_name : undefined}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            {staffList.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>{s.full_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Label */}
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground font-medium">Label</p>
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Custom label (optional)"
          className="h-7 text-xs"
          maxLength={100}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-2 pt-1">
        {hasContent && (
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive text-xs h-7 px-2"
            onClick={onClear}
            disabled={saving}
          >
            Clear
          </Button>
        )}
        <Button
          size="sm"
          className="text-xs h-7 px-3 ml-auto"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Save'}
        </Button>
      </div>
    </div>
  )
}
