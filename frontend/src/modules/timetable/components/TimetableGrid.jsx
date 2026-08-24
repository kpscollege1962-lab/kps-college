import { useRef } from 'react'
import { Plus } from 'lucide-react'
import { useDragScroll } from '../hooks/useDragScroll'
import PeriodLabelCell  from './PeriodLabelCell'
import PeriodTimingCell from './PeriodTimingCell'
import PeriodIntervalCell from './PeriodIntervalCell'
import SlotCell         from './SlotCell'

export default function TimetableGrid({
  periods,
  rows,
  subjects,
  staffList,
  savingSlot,
  activeDragData,
  intervalDrafts,
  onIntervalChange,
  onIntervalBlur,
  onAddPeriod,
  onDeletePeriod,
  onUpsertSlot,
  onClearSlot,
  onOpenBreaks,
  swapMode,
  swapFirstSlot,
  onSlotClickInSwapMode,
  saving,
  canManage,
}) {
  const scrollRef = useRef(null)
  useDragScroll(scrollRef)

  return (
    <div ref={scrollRef} className="overflow-auto h-full cursor-grab">
      <table className="border-separate border-spacing-0 text-xs w-full">
        <thead className="sticky top-0 z-20 bg-muted">
          {/* Row 1 — Period labels */}
          <tr>
            <th className="sticky left-0 z-30 bg-muted border border-border px-3 py-1.5 text-left min-w-[130px] text-xs font-semibold">
              Class / Section
            </th>
            {periods.map((period) => (
              <PeriodLabelCell
                key={period.id}
                period={period}
                onDelete={onDeletePeriod}
                onOpenBreaks={onOpenBreaks}
                canManage={canManage}
              />
            ))}
            {canManage && (
              <th
                onClick={onAddPeriod}
                rowSpan={4}
                className="border border-border w-10 min-w-[40px] bg-muted cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center justify-center">
                  <Plus className="h-4 w-4" />
                </div>
              </th>
            )}
          </tr>
          {/* Row 2 — Full Day timings (read-only derived display) */}
          <tr>
            <th className="sticky left-0 z-30 bg-muted border border-border px-3 py-1 text-left min-w-[130px]">
              <span className="text-[10px] text-muted-foreground font-medium">Full Day</span>
            </th>
            {periods.map((period) => (
              <PeriodTimingCell
                key={period.id}
                period={period}
                config="full_day"
              />
            ))}
          </tr>
          {/* Row 3 — Half Day timings (read-only derived display) */}
          <tr>
            <th className="sticky left-0 z-30 bg-muted border border-border px-3 py-1 text-left min-w-[130px]">
              <span className="text-[10px] text-muted-foreground font-medium">Half Day</span>
            </th>
            {periods.map((period) => (
              <PeriodTimingCell
                key={period.id}
                period={period}
                config="half_day"
              />
            ))}
          </tr>
          {/* Row 4 — Interval inputs (editable, drives chain calculation) */}
          <tr>
            <th className="sticky left-0 z-30 bg-muted border border-border px-3 py-0.5 text-left min-w-[130px]">
              <span className="text-[10px] text-muted-foreground font-medium">Interval</span>
            </th>
            {periods.map((period) => (
              <PeriodIntervalCell
                key={period.id}
                period={period}
                intervalDrafts={intervalDrafts}
                onIntervalChange={onIntervalChange}
                onIntervalBlur={onIntervalBlur}
                canManage={canManage}
              />
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={`${row.classGroupId}-${row.sectionId}`}>
              {/* Row label — sticky left */}
              <td className="sticky left-0 z-10 bg-muted border border-border px-3 py-2 font-medium whitespace-nowrap text-xs">
                {row.classGroupName}
                {row.sectionName && (
                  <span className="text-muted-foreground ml-1 font-normal">{row.sectionName}</span>
                )}
              </td>

              {periods.map((period) => {
                const slot = period.slots?.find(
                  (s) => s.class_group_id === row.classGroupId && s.section_id === row.sectionId,
                ) ?? null
                const isSaving = !!(
                  savingSlot &&
                  savingSlot.periodId === period.id &&
                  savingSlot.classGroupId === row.classGroupId &&
                  savingSlot.sectionId === row.sectionId
                )
                const isSwapSelected = !!(
                  swapMode && swapFirstSlot &&
                  swapFirstSlot.periodId === period.id &&
                  swapFirstSlot.classGroupId === row.classGroupId &&
                  swapFirstSlot.sectionId === row.sectionId
                )
                return (
                  <SlotCell
                    key={period.id}
                    slot={slot}
                    period={period}
                    classGroupId={row.classGroupId}
                    sectionId={row.sectionId}
                    subjects={subjects}
                    staffList={staffList}
                    isSaving={isSaving}
                    activeDragData={activeDragData}
                    swapMode={swapMode}
                    isSwapSelected={isSwapSelected}
                    onSlotClickInSwapMode={onSlotClickInSwapMode}
                    onUpsert={onUpsertSlot}
                    onClear={onClearSlot}
                    saving={saving}
                    canManage={canManage}
                  />
                )
              })}

              {canManage && <td className="border border-border w-10 min-w-[40px]" />}
            </tr>
          ))}

          {rows.length === 0 && (
            <tr>
              <td
                colSpan={periods.length + (canManage ? 2 : 1)}
                className="text-center py-12 text-muted-foreground italic text-sm"
              >
                No enrolled classes/sections found for the selected session.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
