import { useState, useCallback, useRef } from 'react'
import {
  getCampusTimetableService,
  createPeriodService,
  deletePeriodService,
  upsertSlotService,
  clearSlotService,
  updatePeriodBreaksService,
  batchUpdateTimingsService,
  swapSlotsService,
} from '../services/timetable.service'

export const useTimetable = () => {
  const [periods, setPeriods] = useState([])
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [saving, setSaving] = useState(false)
  const [createPeriodError, setCreatePeriodError] = useState(null)
  const [recalcError, setRecalcError] = useState(null)

  const [savingSlot, setSavingSlot] = useState(null) // { periodId, classGroupId, sectionId } | null
  const [upsertSlotError, setUpsertSlotError] = useState(null)
  const [clearSlotError, setClearSlotError] = useState(null)

  const [breaksError, setBreaksError] = useState(null)

  const [swapSlotsError, setSwapSlotsError] = useState(null)

  const [deleting, setDeleting] = useState(false)
  const [deletePeriodError, setDeletePeriodError] = useState(null)

  const campusIdRef  = useRef(null)
  const sessionIdRef = useRef(null)

  // ── Full fetch (used on initial load, createPeriod, deletePeriod) ─────────────

  const fetchTimetable = useCallback(async (campusId, sessionId) => {
    campusIdRef.current  = campusId
    sessionIdRef.current = sessionId
    setLoading(true)
    setError(null)

    const result = await getCampusTimetableService(campusId, sessionId)

    setLoading(false)

    if (result.success) {
      setPeriods(result.data.periods)
      setRows(result.data.rows ?? [])
    } else {
      setError(result.message)
    }
  }, [])

  // ── createPeriod — full refetch (new period column added) ─────────────────────

  const createPeriod = useCallback(async (campusId, data) => {
    setSaving(true)
    setCreatePeriodError(null)

    const result = await createPeriodService(campusId, data)

    setSaving(false)

    if (result.success) {
      await fetchTimetable(campusIdRef.current, sessionIdRef.current)
    } else {
      const fieldErrors = result.data?.errors?.fieldErrors
      setCreatePeriodError(
        fieldErrors && Object.keys(fieldErrors).length > 0
          ? Object.values(fieldErrors).join('; ')
          : result.message
      )
    }

    return { success: result.success, message: result.message, data: result.data }
  }, [fetchTimetable])

  // ── recalculateTimings — batch save chain-calculated timings ──────────────────
  // Receives the full pre-computed array of { periodId, config, startTime, endTime }
  // for ALL periods of a given config. Saves in one request. Patches periods state
  // with returned updated timings.

  const recalculateTimings = useCallback(async (campusId, timings) => {
    setSaving(true)
    setRecalcError(null)

    const result = await batchUpdateTimingsService(campusId, { timings })

    setSaving(false)

    if (result.success) {
      const updatedTimings = result.data.timings
      setPeriods((prev) =>
        prev.map((period) => {
          const newTimings = updatedTimings.filter((t) => t.period_id === period.id)
          if (!newTimings.length) return period
          return {
            ...period,
            timings: period.timings.map((t) => {
              const updated = newTimings.find((nt) => nt.config === t.config)
              return updated ? { ...t, ...updated } : t
            }),
          }
        })
      )
    } else {
      const fieldErrors = result.data?.errors?.fieldErrors
      setRecalcError(
        fieldErrors && Object.keys(fieldErrors).length > 0
          ? Object.values(fieldErrors).join('; ')
          : result.message
      )
    }

    return { success: result.success, message: result.message }
  }, [])

  // ── updateBreaks — patch full period in local state ───────────────────────────

  const updateBreaks = useCallback(async (campusId, periodId, data) => {
    setSaving(true)
    setBreaksError(null)

    const result = await updatePeriodBreaksService(campusId, periodId, data)

    setSaving(false)

    if (result.success) {
      const updatedPeriod = result.data.period
      setPeriods((prev) =>
        prev.map((p) => p.id === periodId ? updatedPeriod : p)
      )
    } else {
      const fieldErrors = result.data?.errors?.fieldErrors
      setBreaksError(
        fieldErrors && Object.keys(fieldErrors).length > 0
          ? Object.values(fieldErrors).join('; ')
          : result.message
      )
    }

    return { success: result.success, message: result.message, data: result.data }
  }, [])

  // ── deletePeriod — full refetch (period column removed) ───────────────────────

  const deletePeriod = useCallback(async (campusId, periodId) => {
    setDeleting(true)
    setDeletePeriodError(null)

    const result = await deletePeriodService(campusId, periodId)

    setDeleting(false)

    if (result.success) {
      await fetchTimetable(campusIdRef.current, sessionIdRef.current)
    } else {
      setDeletePeriodError(result.message)
    }

    return { success: result.success, message: result.message }
  }, [fetchTimetable])

  // ── upsertSlot — patch local state with returned slot ────────────────────────

  const upsertSlot = useCallback(async (campusId, periodId, classGroupId, sectionId, data) => {
    setSaving(true)
    setUpsertSlotError(null)
    setSavingSlot({ periodId, classGroupId, sectionId })

    const result = await upsertSlotService(campusId, periodId, classGroupId, sectionId, data)

    setSaving(false)
    setSavingSlot(null)

    if (result.success) {
      const updatedSlot = result.data.slot
      setPeriods((prev) =>
        prev.map((period) => {
          if (period.id !== periodId) return period
          const existingSlots = period.slots ?? []
          const slotIndex = existingSlots.findIndex(
            (s) => s.class_group_id === classGroupId && s.section_id === sectionId
          )
          let newSlots
          if (slotIndex !== -1) {
            newSlots = existingSlots.map((s, i) => (i === slotIndex ? updatedSlot : s))
          } else {
            newSlots = [...existingSlots, updatedSlot]
          }
          return { ...period, slots: newSlots }
        })
      )
    } else {
      const fieldErrors = result.data?.errors?.fieldErrors
      setUpsertSlotError(
        fieldErrors && Object.keys(fieldErrors).length > 0
          ? Object.values(fieldErrors).join('; ')
          : result.message
      )
    }

    return { success: result.success, message: result.message, data: result.data }
  }, [])

  // ── clearSlot — patch local state with returned cleared slot ─────────────────

  const clearSlot = useCallback(async (campusId, periodId, classGroupId, sectionId) => {
    setSaving(true)
    setClearSlotError(null)
    setSavingSlot({ periodId, classGroupId, sectionId })

    const result = await clearSlotService(campusId, periodId, classGroupId, sectionId)

    setSaving(false)
    setSavingSlot(null)

    if (result.success) {
      setPeriods((prev) =>
        prev.map((period) => {
          if (period.id !== periodId) return period
          return {
            ...period,
            slots: (period.slots ?? []).filter(
              (s) => !(s.class_group_id === classGroupId && s.section_id === sectionId)
            ),
          }
        })
      )
    } else {
      setClearSlotError(result.message)
    }

    return { success: result.success, message: result.message, data: result.data }
  }, [])

  // ── swapSlots — atomic swap (possibly cross-period), patches both slots in local state ─
  const swapSlots = useCallback(async (campusId, slotA, slotB) => {
    setSaving(true)
    setSwapSlotsError(null)
    const result = await swapSlotsService(campusId, slotA, slotB)
    setSaving(false)
    if (result.success) {
      const { slotA: updatedA, slotB: updatedB } = result.data
      const applyUpdate = (slots, updated, classGroupId, sectionId) => {
        if (updated === null) {
          return slots.filter(
            (s) => !(s.class_group_id === classGroupId && s.section_id === sectionId)
          )
        }
        const idx = slots.findIndex(
          (s) => s.class_group_id === classGroupId && s.section_id === sectionId
        )
        if (idx !== -1) return slots.map((s, i) => (i === idx ? updated : s))
        return [...slots, updated]
      }
      setPeriods((prev) =>
        prev.map((period) => {
          let newSlots = period.slots ?? []
          let changed = false
          if (period.id === slotA.periodId) {
            newSlots = applyUpdate(newSlots, updatedA, slotA.classGroupId, slotA.sectionId)
            changed = true
          }
          if (period.id === slotB.periodId) {
            newSlots = applyUpdate(newSlots, updatedB, slotB.classGroupId, slotB.sectionId)
            changed = true
          }
          return changed ? { ...period, slots: newSlots } : period
        })
      )
    } else {
      const fieldErrors = result.data?.errors?.fieldErrors
      setSwapSlotsError(
        fieldErrors && Object.keys(fieldErrors).length > 0
          ? Object.values(fieldErrors).join('; ')
          : result.message
      )
    }
    return { success: result.success, message: result.message }
  }, [])

  return {
    periods,
    rows,
    loading,
    error,
    saving,
    createPeriodError,
    recalcError,
    breaksError,
    upsertSlotError,
    clearSlotError,
    swapSlotsError,
    savingSlot,
    deleting,
    deletePeriodError,
    fetchTimetable,
    createPeriod,
    recalculateTimings,
    updateBreaks,
    deletePeriod,
    upsertSlot,
    clearSlot,
    swapSlots,
  }
}
