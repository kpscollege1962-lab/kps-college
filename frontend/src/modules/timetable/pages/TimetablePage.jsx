import { useEffect, useState, useCallback } from 'react'
import { useAbility } from '@casl/react'
import { AbilityContext } from '@/casl/AbilityProvider'
import { DragDropProvider, DragOverlay } from '@dnd-kit/react'
import { useRoleContext } from '@/modules/auth/hooks/useRoleContext'
import { useSessionContext } from '@/shells/portal/hooks/useSessionContext'
import { toast } from 'sonner'
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { Maximize2, Minimize2, ArrowLeftRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { listSubjectsService } from '@/modules/subjects/services/subjects.service'
import { getTimetableStaffService } from '../services/timetable.service'
import { useTimetable } from '../hooks/useTimetable'
import TimetableHeader from '../components/TimetableHeader'
import TimetableGrid from '../components/TimetableGrid'
import SubjectsPanel from '../components/SubjectsPanel'
import StaffPanel from '../components/StaffPanel'
import AddPeriodDialog from '../components/AddPeriodDialog'
import PeriodBreaksDialog from '../components/PeriodBreaksDialog'
import DragOverlayContent from '../components/DragOverlayContent'

export default function TimetablePage() {
  const { activeRole } = useRoleContext()
  const campusId = activeRole.campusId

  const { activeSession } = useSessionContext()
  const sessionId = activeSession?.id ?? null

  const ability = useAbility(AbilityContext)
  const canManage = ability.can('manage', 'Timetable')

  const {
    periods, rows, loading, error,
    saving, savingSlot,
    createPeriodError, recalcError, breaksError, upsertSlotError, clearSlotError,
    swapSlotsError,
    deleting, deletePeriodError,
    fetchTimetable,
    createPeriod,
    recalculateTimings,
    updateBreaks,
    deletePeriod,
    upsertSlot,
    clearSlot,
    swapSlots,
  } = useTimetable()

  // Panel resources
  const [subjectsPanelOpen, setSubjectsPanelOpen] = useState(true)
  const [staffPanelOpen, setStaffPanelOpen] = useState(true)
  const [subjects, setSubjects] = useState([])
  const [staffList, setStaffList] = useState([])

  // Add period dialog
  const [addPeriodOpen, setAddPeriodOpen] = useState(false)

  // Delete period confirmation
  const [deletePeriodId, setDeletePeriodId] = useState(null)

  // Breaks dialog
  const [breaksPeriod, setBreaksPeriod] = useState(null)

  // Anchor time — shared start time for FD and HD chain calculation
  const [anchorTime, setAnchorTime] = useState('')

  // Interval drafts — { [periodId-config]: intervalMinutes }
  const [intervalDrafts, setIntervalDrafts] = useState({})

  // Drag overlay data
  const [activeDragData, setActiveDragData] = useState(null)

  // Expanded (CSS fixed positioning)
  const [isExpanded, setIsExpanded] = useState(false)

  // Swap mode — null when inactive, { periodId, classGroupId, sectionId } when first
  // slot is selected and awaiting the second click
  const [swapMode, setSwapMode] = useState(false)
  const [swapFirstSlot, setSwapFirstSlot] = useState(null)

  // Refetch the timetable whenever the active session changes (also covers initial mount)
  useEffect(() => {
    fetchTimetable(campusId, sessionId)
  }, [campusId, sessionId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    Promise.all([
      getTimetableStaffService(campusId),
      listSubjectsService(),
    ]).then(([staffResult, subResult]) => {
      if (staffResult.success) setStaffList(staffResult.data.staff ?? [])
      if (subResult.success) setSubjects(subResult.data.data ?? [])
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (error) toast.error(error) }, [error])
  useEffect(() => { if (createPeriodError) toast.error(createPeriodError) }, [createPeriodError])
  useEffect(() => { if (recalcError) toast.error(recalcError) }, [recalcError])
  useEffect(() => { if (upsertSlotError) toast.error(upsertSlotError) }, [upsertSlotError])
  useEffect(() => { if (clearSlotError) toast.error(clearSlotError) }, [clearSlotError])
  useEffect(() => { if (deletePeriodError) toast.error(deletePeriodError) }, [deletePeriodError])
  useEffect(() => { if (breaksError) toast.error(breaksError) }, [breaksError])
  useEffect(() => { if (swapSlotsError) toast.error(swapSlotsError) }, [swapSlotsError])

  useEffect(() => {
    if (!swapMode) return
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setSwapMode(false)
        setSwapFirstSlot(null)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [swapMode])

  // Seed intervalDrafts from loaded/updated periods
  useEffect(() => {
    if (!periods.length) return
    const toSec = (t) => {
      if (!t) return null
      const [h, m, s = 0] = t.split(':').map(Number)
      return h * 3600 + m * 60 + s
    }
    const drafts = {}
    for (const period of periods) {
      for (const config of ['full_day', 'half_day']) {
        const t = period.timings?.find((pt) => pt.config === config)
        if (t?.start_time && t?.end_time) {
          const min = Math.round((toSec(t.end_time) - toSec(t.start_time)) / 60)
          if (min > 0) drafts[`${period.id}-${config}`] = min
        }
      }
    }
    setIntervalDrafts(drafts)
  }, [periods])

  // Seed anchorTime from first period's FD start_time if not already set
  useEffect(() => {
    if (anchorTime) return
    const sorted = [...periods].sort((a, b) => a.period_number - b.period_number)
    const first = sorted[0]
    const fdTiming = first?.timings?.find((t) => t.config === 'full_day')
    if (fdTiming?.start_time) setAnchorTime(fdTiming.start_time.slice(0, 5))
  }, [periods]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ──────────────────────────────────────────────────────────────────

  const handleRefresh = () => {
    fetchTimetable(campusId, sessionId)
    Promise.all([
      getTimetableStaffService(campusId),
      listSubjectsService(),
    ]).then(([staffResult, subResult]) => {
      if (staffResult.success) setStaffList(staffResult.data.staff ?? [])
      if (subResult.success) setSubjects(subResult.data.data ?? [])
    })
  }

  const toggleExpand = () => setIsExpanded((v) => !v)

  const toggleSwapMode = () => {
    setSwapMode((v) => !v)
    setSwapFirstSlot(null)
  }

  const handleSlotClickInSwapMode = useCallback(async (periodId, classGroupId, sectionId) => {
    if (!swapFirstSlot) {
      setSwapFirstSlot({ periodId, classGroupId, sectionId })
      return
    }
    // Clicking the same slot again deselects it
    if (
      swapFirstSlot.periodId === periodId &&
      swapFirstSlot.classGroupId === classGroupId &&
      swapFirstSlot.sectionId === sectionId
    ) {
      setSwapFirstSlot(null)
      return
    }
    const slotA = {
      periodId:     swapFirstSlot.periodId,
      classGroupId: swapFirstSlot.classGroupId,
      sectionId:    swapFirstSlot.sectionId,
    }
    const slotB = { periodId, classGroupId, sectionId }
    setSwapFirstSlot(null)
    await swapSlots(campusId, slotA, slotB)
  }, [swapFirstSlot, campusId, swapSlots])

  const handleAddPeriod = async ({ periodNumber }) => {
    const result = await createPeriod(campusId, { periodNumber })
    if (result.success) setAddPeriodOpen(false)
  }

  const handleDeletePeriod = (periodId) => {
    setDeletePeriodId(periodId)
  }

  const confirmDeletePeriod = async () => {
    await deletePeriod(campusId, deletePeriodId)
    setDeletePeriodId(null)
  }

  const handleIntervalChange = useCallback((periodId, config, value) => {
    setIntervalDrafts((prev) => ({
      ...prev,
      [`${periodId}-${config}`]: value,
    }))
  }, [])

  const handleIntervalBlur = useCallback(async (config) => {
    if (!anchorTime) return
    const sorted = [...periods].sort((a, b) => a.period_number - b.period_number)
    const toSec = (t) => {
      if (!t) return null
      const [h, m, s = 0] = t.split(':').map(Number)
      return h * 3600 + m * 60 + s
    }
    const secToHHMM = (s) => {
      // Apply % 86400 (seconds in a day) to wrap midnight correctly,
      // then % 24 on hours to ensure HH is always 00-23.
      const wrapped = ((s % 86400) + 86400) % 86400  // handles negative values too
      const h = Math.floor(wrapped / 3600)
      const m = Math.floor((wrapped % 3600) / 60)
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    }
    let cursor = toSec(anchorTime)
    if (cursor == null) return
    const timings = []
    for (const period of sorted) {
      const draftKey = `${period.id}-${config}`
      const intervalMin = intervalDrafts[draftKey]
        ?? (() => {
          const t = period.timings?.find((pt) => pt.config === config)
          if (!t?.start_time || !t?.end_time) return null
          return Math.round((toSec(t.end_time) - toSec(t.start_time)) / 60)
        })()
      if (!intervalMin || intervalMin <= 0) {
        const t = period.timings?.find((pt) => pt.config === config)
        if (t?.end_time) cursor = toSec(t.end_time)
        continue
      }
      const startSec = cursor
      const endSec   = cursor + intervalMin * 60
      timings.push({
        periodId:  period.id,
        config,
        startTime: secToHHMM(startSec),
        endTime:   secToHHMM(endSec),
      })
      cursor = endSec
    }
    if (timings.length > 0) {
      await recalculateTimings(campusId, timings)
    }
  }, [anchorTime, intervalDrafts, periods, campusId, recalculateTimings])

  const handleOpenBreaks = useCallback((period) => {
    setBreaksPeriod(period)
  }, [])

  const handleSaveBreaks = async (data) => {
    const result = await updateBreaks(campusId, breaksPeriod.id, data)
    if (result.success) setBreaksPeriod(null)
  }

  const handleUpsertSlot = useCallback(async (periodId, classGroupId, sectionId, data) => {
    await upsertSlot(campusId, periodId, classGroupId, sectionId, data)
  }, [campusId, upsertSlot])

  const handleClearSlot = useCallback(async (periodId, classGroupId, sectionId) => {
    await clearSlot(campusId, periodId, classGroupId, sectionId)
  }, [campusId, clearSlot])

  // ── Drag and Drop ─────────────────────────────────────────────────────────────

  const handleDragStart = ({ operation }) => {
    setActiveDragData(operation.source?.data ?? null)
  }

  const handleDragEnd = async ({ operation, canceled }) => {
    setActiveDragData(null)
    if (canceled || !operation.target) return

    const targetId = operation.target.id // "slot-{periodId}-{classGroupId}-{sectionId}"
    const parts = targetId.split('-')
    if (parts[0] !== 'slot') return

    const [, periodId, classGroupId, sectionId] = parts.map((v, i) => i === 0 ? v : parseInt(v))
    const dragData = operation.source?.data
    if (!dragData) return

    const period = periods.find((p) => p.id === periodId)
    const existingSlot = period?.slots?.find(
      (s) => s.class_group_id === classGroupId && s.section_id === sectionId,
    )

    let payload = {}

    if (dragData.type === 'subject') {
      const hasSubject1 = existingSlot?.subject_id_1 != null
      const hasSubject2 = existingSlot?.subject_id_2 != null
      if (!hasSubject1) {
        payload = {
          subjectId1: dragData.subjectId,
          subjectId2: existingSlot?.subject_id_2 ?? null,
          staffId1: existingSlot?.staff_id_1 ?? null,
          staffId2: existingSlot?.staff_id_2 ?? null,
          label: existingSlot?.label ?? null,
        }
      } else if (!hasSubject2) {
        payload = {
          subjectId1: existingSlot.subject_id_1,
          subjectId2: dragData.subjectId,
          staffId1: existingSlot?.staff_id_1 ?? null,
          staffId2: existingSlot?.staff_id_2 ?? null,
          label: existingSlot?.label ?? null,
        }
      } else {
        return
      }
    } else if (dragData.type === 'staff') {
      const hasStaff1 = existingSlot?.staff_id_1 != null
      const hasStaff2 = existingSlot?.staff_id_2 != null
      if (!hasStaff1) {
        payload = {
          subjectId1: existingSlot?.subject_id_1 ?? null,
          subjectId2: existingSlot?.subject_id_2 ?? null,
          staffId1: dragData.staffId,
          staffId2: existingSlot?.staff_id_2 ?? null,
          label: existingSlot?.label ?? null,
        }
      } else if (!hasStaff2) {
        payload = {
          subjectId1: existingSlot?.subject_id_1 ?? null,
          subjectId2: existingSlot?.subject_id_2 ?? null,
          staffId1: existingSlot.staff_id_1,
          staffId2: dragData.staffId,
          label: existingSlot?.label ?? null,
        }
      } else {
        return
      }
    } else {
      return
    }

    await handleUpsertSlot(periodId, classGroupId, sectionId, payload)
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <DragDropProvider onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-4">

        <TimetableHeader
          loading={loading}
          onRefresh={handleRefresh}
          anchorTime={anchorTime}
          onAnchorChange={setAnchorTime}
          onAnchorBlur={(config) => handleIntervalBlur(config)}
          canManage={canManage}
        />

        {loading && periods.length === 0 ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div
            className={cn(
              'flex flex-col border border-border bg-card',
              isExpanded
                ? 'fixed inset-0 z-50 rounded-none'
                : 'mt-4 h-[70vh] rounded-2xl overflow-hidden',
            )}
          >
            {/* Toolbar row */}
            <div className="flex items-center justify-end gap-1 px-2 py-1 border-b border-border shrink-0">
              {canManage && (
                <Button
                  variant={swapMode ? 'default' : 'ghost'}
                  size="icon"
                  onClick={toggleSwapMode}
                  title={swapMode ? 'Exit swap mode (Esc)' : 'Swap slots'}
                  className={cn(
                    'h-7 w-7',
                    swapMode ? 'bg-amber-500 text-white hover:bg-amber-600' : 'text-muted-foreground',
                  )}
                >
                  <ArrowLeftRight className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleExpand}
                title={isExpanded ? 'Exit expanded view' : 'Expand timetable'}
                className="h-7 w-7 text-muted-foreground"
              >
                {isExpanded
                  ? <Minimize2 className="h-3.5 w-3.5" />
                  : <Maximize2 className="h-3.5 w-3.5" />
                }
              </Button>
            </div>

            {/* Content row — subjects panel | grid | staff panel */}
            <div className="flex flex-1 overflow-hidden">

              {canManage && (
                <SubjectsPanel
                  subjects={subjects}
                  open={subjectsPanelOpen}
                  onToggle={() => setSubjectsPanelOpen((p) => !p)}
                />
              )}

              <div className="flex-1 overflow-hidden h-full">
                <TimetableGrid
                  periods={periods}
                  rows={rows}
                  subjects={subjects}
                  staffList={staffList}
                  savingSlot={savingSlot}
                  activeDragData={activeDragData}
                  intervalDrafts={intervalDrafts}
                  onIntervalChange={handleIntervalChange}
                  onIntervalBlur={handleIntervalBlur}
                  onAddPeriod={() => setAddPeriodOpen(true)}
                  onDeletePeriod={handleDeletePeriod}
                  swapMode={swapMode}
                  swapFirstSlot={swapFirstSlot}
                  onSlotClickInSwapMode={handleSlotClickInSwapMode}
                  onUpsertSlot={handleUpsertSlot}
                  onClearSlot={handleClearSlot}
                  onOpenBreaks={handleOpenBreaks}
                  saving={saving}
                  canManage={canManage}
                />
              </div>

              {canManage && (
                <StaffPanel
                  staffList={staffList}
                  open={staffPanelOpen}
                  onToggle={() => setStaffPanelOpen((p) => !p)}
                />
              )}

            </div>
          </div>
        )}

        <AlertDialog open={deletePeriodId !== null} onOpenChange={(open) => { if (!open) setDeletePeriodId(null) }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete period?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the period along with all its timetable slots and timing
                configurations. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={confirmDeletePeriod} disabled={saving}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <PeriodBreaksDialog
          open={breaksPeriod !== null}
          period={breaksPeriod}
          rows={rows}
          saving={saving}
          onSave={handleSaveBreaks}
          onClose={() => setBreaksPeriod(null)}
        />

        <AddPeriodDialog
          open={addPeriodOpen}
          onOpenChange={setAddPeriodOpen}
          suggestedNumber={periods.length + 1}
          onSubmit={handleAddPeriod}
          saving={saving}
        />

        <DragOverlay>
          {activeDragData && <DragOverlayContent dragData={activeDragData} />}
        </DragOverlay>

      </div>
    </DragDropProvider>
  )
}
