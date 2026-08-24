import { useState, useEffect } from 'react'
import { useSessionContext }   from '@/shells/portal/hooks/useSessionContext'
import { listCampusesService } from '@/modules/campuses/services/campuses.service'
import { listClassesService }  from '@/modules/classes/services/classes.service'

export function useEnrollmentSetup({ isCreateMode }) {
  const { activeSession } = useSessionContext()

  // ── Selection state ───────────────────────────────────────────────────────
  const [enrollCampusId,  setEnrollCampusId]  = useState(null)
  const [enrollClassId,   setEnrollClassId]   = useState(null)
  const [enrollSectionId, setEnrollSectionId] = useState('')

  // ── Reference data ────────────────────────────────────────────────────────
  const [campuses,        setCampuses]        = useState([])
  const [campusesLoading, setCampusesLoading] = useState(false)
  const [campusesError,   setCampusesError]   = useState(null)

  const [classes,         setClasses]         = useState([])
  const [classesLoading,  setClassesLoading]  = useState(false)
  const [classesError,    setClassesError]    = useState(null)

  // sections are derived synchronously from the selected class — no API call, no loading state

  // ── Load campuses on dialog open (create mode only) ───────────────────────
  useEffect(() => {
    if (!isCreateMode) return
    setCampusesLoading(true)
    setCampusesError(null)
    listCampusesService({}).then(result => {
      setCampusesLoading(false)
      if (result.success) {
        setCampuses(result.data?.data ?? [])
      } else {
        setCampusesError(result.message ?? 'Failed to load campuses')
      }
    })
  }, [isCreateMode])

  // ── Load classes when campus is selected ──────────────────────────────────
  useEffect(() => {
    // Reset downstream selections
    setEnrollClassId(null)
    setEnrollSectionId('')
    setClasses([])
    setClassesError(null)

    if (!enrollCampusId || !activeSession?.id) return

    setClassesLoading(true)
    listClassesService(enrollCampusId, { sessionId: activeSession.id }).then(result => {
      setClassesLoading(false)
      if (result.success) {
        setClasses(result.data?.data ?? [])
      } else {
        setClassesError(result.message ?? 'Failed to load classes')
      }
    })
  }, [enrollCampusId, activeSession?.id])

  // ── Reset section when class changes ─────────────────────────────────────
  useEffect(() => {
    setEnrollSectionId('')
  }, [enrollClassId])

  // ── Derived sections from the selected class ──────────────────────────────
  const selectedClassObj = classes.find(c => c.id === enrollClassId) ?? null
  const sections = selectedClassObj?.sections ?? []

  return {
    activeSession,
    // campuses
    campuses, campusesLoading, campusesError,
    enrollCampusId, setEnrollCampusId,
    // classes
    classes, classesLoading, classesError,
    enrollClassId, setEnrollClassId,
    // sections (derived, no loading state)
    sections,
    enrollSectionId, setEnrollSectionId,
  }
}
