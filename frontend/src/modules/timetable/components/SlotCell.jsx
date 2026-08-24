import { useState } from 'react'
import { X } from 'lucide-react'
import { useDroppable } from '@dnd-kit/react'
import { cn } from '@/lib/utils'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import SlotPopover from './SlotPopover'

export default function SlotCell({
  slot, period, classGroupId, sectionId,
  subjects, staffList,
  isSaving,
  activeDragData,
  swapMode, isSwapSelected, onSlotClickInSwapMode,
  onUpsert, onClear, saving, canManage,
}) {
  const droppableId = `slot-${period.id}-${classGroupId}-${sectionId}`
  const { ref, isDropTarget } = useDroppable({
    id: droppableId,
    data: { periodId: period.id, classGroupId, sectionId },
  })

  const [popoverOpen, setPopoverOpen] = useState(false)

  const hasContent = slot && (slot.subject_id_1 || slot.staff_id_1 || slot.staff_id_2 || slot.label)

  const slotLabel = slot?.label || null

  const subject1Initials = slot?.subject1 ? (slot.subject1.name_initials || slot.subject1.name) : null
  const subject2Initials = slot?.subject2 ? (slot.subject2.name_initials || slot.subject2.name) : null
  const staff1Initials   = slot?.staff1   ? (slot.staff1.name_initials   || slot.staff1.full_name)   : null
  const staff2Initials   = slot?.staff2   ? (slot.staff2.name_initials   || slot.staff2.full_name)   : null

  // Two-line mode only when both subjects are set AND two different teachers are
  // assigned (one per subject). Otherwise everything collapses into the merged
  // single-line display, same as before.
  const bothSubjectsSet = Boolean(slot?.subject_id_1 && slot?.subject_id_2)
  const bothStaffDifferent = Boolean(
    slot?.staff_id_1 && slot?.staff_id_2 && slot.staff_id_1 !== slot.staff_id_2,
  )
  const useTwoLines = bothSubjectsSet && bothStaffDifferent

  const subjectLine = !useTwoLines && subject1Initials
    ? `${subject1Initials}${subject2Initials ? ` / ${subject2Initials}` : ''}`
    : null
  const staffLabel = !useTwoLines ? (staff1Initials || staff2Initials || null) : null

  const handleUpsert = async (data) => {
    await onUpsert(period.id, classGroupId, sectionId, data)
    setPopoverOpen(false)
  }

  const handleClear = async () => {
    await onClear(period.id, classGroupId, sectionId)
    setPopoverOpen(false)
  }

  const contentNode = hasContent ? (
    <div className="space-y-0.5 pr-3">
      {slotLabel && (
        <p className="font-medium text-foreground leading-tight">{slotLabel}</p>
      )}
      {useTwoLines ? (
        <>
          <p className="text-muted-foreground/80 leading-tight">{subject1Initials} · {staff1Initials}</p>
          <p className="text-muted-foreground/80 leading-tight">{subject2Initials} · {staff2Initials}</p>
        </>
      ) : (
        <>
          {subjectLine && (
            <p className="text-muted-foreground/80 leading-tight">{subjectLine}</p>
          )}
          {staffLabel && (
            <p className="text-muted-foreground leading-tight">{staffLabel}</p>
          )}
        </>
      )}
    </div>
  ) : (
    <span className="text-muted-foreground italic select-none">—</span>
  )

  // ── Break strip sizing ──────────────────────────────────────────────────────
  const fdTiming    = period.timings?.find((t) => t.config === 'full_day')
  const hdTiming    = period.timings?.find((t) => t.config === 'half_day')
  const rawPosition = slot?.break_position ?? null
  // Only activate the strip when a break duration is set on either config.
  // This keeps slot.break_position intact even when timings are temporarily cleared.
  const hasBreak = (fdTiming?.break_duration > 0) || (hdTiming?.break_duration > 0)
  const breakPosition = (rawPosition === 'before' || rawPosition === 'after') && hasBreak
    ? rawPosition
    : null



  // Contextual drop hint — only shown when a subject or staff chip is being dragged
  // and this cell is the active drop target
  const dropHint = (() => {
    if (!isDropTarget) return null
    if (activeDragData?.type === 'subject') {
      const hasSubject1 = slot?.subject_id_1 != null
      const hasSubject2 = slot?.subject_id_2 != null
      if (!hasSubject1)          return 'Drop for primary'
      if (!hasSubject2)          return 'Drop for alternate'
      return 'Open popover to edit'  // both filled — drop is a no-op
    }
    if (activeDragData?.type === 'staff') {
      const hasStaff1 = slot?.staff_id_1 != null
      const hasStaff2 = slot?.staff_id_2 != null
      if (!hasStaff1)            return 'Drop for primary'
      if (!hasStaff2)            return 'Drop for alternate'
      return 'Open popover to edit'  // both filled — drop is a no-op
    }
    return null
  })()

  // ── The <td> is the droppable zone AND the click target.
  //
  // A full-cell invisible div (pointer-events-none, absolute inset-0) is used as the
  // PopoverTrigger anchor for positioning only — it doesn't intercept any events.
  // The td's onClick opens the popover, so the entire cell is always clickable
  // regardless of content height.
  //
  // Base UI injects FocusGuard <span> siblings next to the trigger element. Here those
  // spans land inside <td> alongside normal content — valid HTML, no phantom columns.
  return (
    <td
      ref={ref}
      className={cn(
        'border border-border min-w-[80px] align-top text-xs transition-colors relative group h-full',
        isDropTarget && !swapMode && 'bg-accent/60 ring-1 ring-inset ring-primary',
        swapMode && canManage && !isSaving && 'cursor-pointer hover:bg-amber-500/10',
        swapMode && isSwapSelected && 'ring-2 ring-inset ring-amber-500 bg-amber-500/10',
        !swapMode && canManage && !isSaving && 'cursor-pointer hover:bg-accent/30',
        isSaving && 'cursor-wait',
      )}
      onClick={
        !canManage || isSaving
          ? undefined
          : swapMode
            ? () => onSlotClickInSwapMode(period.id, classGroupId, sectionId)
            : () => setPopoverOpen(true)
      }
    >
      {/* Per-cell loading overlay */}
      {isSaving && <Skeleton className="absolute inset-0 rounded-none z-10" />}

      {canManage && !swapMode && (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger
            nativeButton={false}
            render={
              <div className="absolute inset-0 pointer-events-none" aria-hidden="true" />
            }
          />
          <PopoverContent className="w-auto p-3" side="bottom" align="start">
            <SlotPopover
              slot={slot}
              subjects={subjects}
              staffList={staffList}
              onSubmit={handleUpsert}
              onClear={handleClear}
              saving={saving}
            />
          </PopoverContent>
        </Popover>
      )}

      {/* Break strip layout */}
      {breakPosition ? (
        <div className="absolute inset-0 flex min-h-[56px]">
          {/* Before strip */}
          {breakPosition === 'before' && (
            <div className="w-6 bg-muted border-r border-border/50 flex items-center justify-center shrink-0">
              <span className="text-[9px] text-muted-foreground/50 rotate-90 whitespace-nowrap">
                Break
              </span>
            </div>
          )}
          {/* Main content */}
          <div className="flex-1 p-1.5 relative">
            {contentNode}
            {canManage && hasContent && !swapMode && (
              <button
                className="absolute top-0 right-0 text-destructive"
                onClick={(e) => { e.stopPropagation(); handleClear() }}
              >
                <X className="h-3 w-3" />
              </button>
            )}
            {dropHint && !swapMode && (
              <div className="absolute bottom-0 inset-x-0 bg-primary/90 text-primary-foreground text-[9px] text-center py-0.5 leading-tight z-20">
                {dropHint}
              </div>
            )}
          </div>
          {/* After strip */}
          {breakPosition === 'after' && (
            <div className="w-6 bg-muted border-l border-border/50 flex items-center justify-center shrink-0">
              <span className="text-[9px] text-muted-foreground/50 rotate-90 whitespace-nowrap">
                Break
              </span>
            </div>
          )}
        </div>
      ) : (
        /* Normal cell — no break strips */
        <>
          <div className={cn('p-1.5 relative', !hasContent && 'min-h-[56px]')}>
            {contentNode}
            {dropHint && !swapMode && (
              <div className="absolute bottom-0 inset-x-0 bg-primary/90 text-primary-foreground text-[9px] text-center py-0.5 leading-tight z-20">
                {dropHint}
              </div>
            )}
          </div>
          {canManage && hasContent && !swapMode && (
            <button
              className="absolute top-1 right-1 text-destructive"
              onClick={(e) => { e.stopPropagation(); handleClear() }}
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </>
      )}
    </td>
  )
}
