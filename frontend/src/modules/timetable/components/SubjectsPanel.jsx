import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import DraggableChip from './DraggableChip'

export default function SubjectsPanel({ subjects, open, onToggle }) {
  return (
    <div
      className="flex flex-col h-full border-r border-border bg-card transition-all overflow-hidden shrink-0"
      style={{ width: open ? 200 : 36 }}
    >
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center h-9 w-full shrink-0 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors border-b border-border"
      >
        {open ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
      </button>

      {open && (
        <div className="flex-1 overflow-y-auto p-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Subjects
          </p>
          <div className="space-y-1.5">
            {subjects.map((s) => (
              <DraggableChip
                key={s.id}
                id={`subject-${s.id}`}
                type="subject"
                name={s.name}
                initials={s.name_initials}
                data={{ type: 'subject', subjectId: s.id, name: s.name, initials: s.name_initials }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
