import { PanelRightClose, PanelRightOpen } from 'lucide-react'
import DraggableChip from './DraggableChip'

export default function StaffPanel({ staffList, open, onToggle }) {
  return (
    <div
      className="flex flex-col h-full border-l border-border bg-card transition-all overflow-hidden shrink-0"
      style={{ width: open ? 200 : 36 }}
    >
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center h-9 w-full shrink-0 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors border-b border-border"
      >
        {open ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
      </button>

      {open && (
        <div className="flex-1 overflow-y-auto p-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Staff
          </p>
          <div className="space-y-1.5">
            {staffList.map((s) => (
              <DraggableChip
                key={s.id}
                id={`staff-${s.id}`}
                type="staff"
                name={s.full_name}
                initials={s.name_initials}
                data={{ type: 'staff', staffId: s.id, name: s.full_name, initials: s.name_initials }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
