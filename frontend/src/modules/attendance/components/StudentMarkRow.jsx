import { useState } from 'react'
import { StickyNote } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const STATUS_OPTIONS = [
  { value: 'present', label: 'P',  activeClass: 'bg-emerald-500 text-white border-emerald-500' },
  { value: 'absent',  label: 'A',  activeClass: 'bg-red-500 text-white border-red-500' },
  { value: 'late',    label: 'L',  activeClass: 'bg-amber-400 text-amber-950 border-amber-400' },
  { value: 'leave',   label: 'Lv', activeClass: 'bg-blue-500 text-white border-blue-500' },
]

export default function StudentMarkRow({ student, record, onUpdate }) {
  const [remarksOpen, setRemarksOpen] = useState(false)

  return (
    <div className="px-4 py-3 space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs text-muted-foreground w-6 shrink-0">{student.classNo}</span>
          <span className="text-sm font-medium truncate">{student.fullName}</span>
          {record.status && record.remarks && (
            <StickyNote className="size-3.5 text-muted-foreground shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onUpdate(student.studentId, 'status', option.value)}
              className={cn(
                'size-8 rounded-md text-xs font-semibold border transition-colors',
                record.status === option.value
                  ? option.activeClass
                  : 'border-border text-muted-foreground hover:bg-muted',
              )}
            >
              {option.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setRemarksOpen((prev) => !prev)}
            className="size-8 rounded-md border border-border text-muted-foreground hover:bg-muted flex items-center justify-center"
            aria-label="Toggle remarks"
          >
            <StickyNote className="size-3.5" />
          </button>
        </div>
      </div>
      {remarksOpen && (
        <Input
          value={record.remarks}
          onChange={(e) => onUpdate(student.studentId, 'remarks', e.target.value)}
          placeholder="Remarks (optional)"
          className="h-8 text-sm"
        />
      )}
    </div>
  )
}
