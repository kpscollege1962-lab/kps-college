import { useState, useCallback, useRef, useEffect } from 'react'
import {
  listClassesService,
  createClassService,
  updateClassService,
  deleteClassService,
  seedDefaultClassesService,
  cloneClassesService,
} from '../services/classes.service'
import {
  listSectionsService,
  addSectionService,
  updateSectionService,
  deleteSectionService,
} from '../services/sections.service'

export const useClasses = (campusId, sessionId) => {
  const [classes, setClasses]   = useState([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState(false)

  const lastParamsRef = useRef({})

  // Reset stale filter/page params whenever the session changes.
  useEffect(() => {
    lastParamsRef.current = {}
  }, [sessionId])

  // ── Fetch full class list (includes embedded named sections) ──────────────
  const fetchClasses = useCallback(async (params = {}) => {
    // sessionId is kept out of the ref — it comes from the closure and is
    // applied last so it can never be overwritten by a stale ref value.
    const userParams = { ...lastParamsRef.current, ...params }
    lastParamsRef.current = userParams
    setLoading(true)
    setError(null)
    const result = await listClassesService(campusId, { ...userParams, sessionId })
    setLoading(false)
    if (result.success) {
      setClasses(result.data.data)
      setTotal(result.data.total)
    } else {
      setError(result.message)
    }
  }, [campusId, sessionId])

  // ── Refresh sections for a single class (after section mutation) ──────────
  // Updates only that class's sections array in state — no full reload.
  const refreshClassSections = useCallback(async (classGroupId) => {
    const result = await listSectionsService(campusId, classGroupId)
    if (result.success) {
      setClasses(prev =>
        prev.map(cls =>
          cls.id === classGroupId
            ? { ...cls, sections: result.data.sections }
            : cls
        )
      )
    }
    return result
  }, [campusId])

  // ── Class CRUD ────────────────────────────────────────────────────────────
  const createClass = useCallback(async (data) => {
    setSaving(true)
    const result = await createClassService(campusId, { ...data, sessionId })
    setSaving(false)
    if (result.success) await fetchClasses()
    return result
  }, [campusId, sessionId, fetchClasses])

  const updateClass = useCallback(async (classGroupId, data) => {
    setSaving(true)
    const result = await updateClassService(campusId, classGroupId, data)
    setSaving(false)
    if (result.success) await fetchClasses()
    return result
  }, [campusId, fetchClasses])

  const deleteClass = useCallback(async (classGroupId) => {
    setDeleting(true)
    const result = await deleteClassService(campusId, classGroupId)
    setDeleting(false)
    if (result.success) await fetchClasses()
    return result
  }, [campusId, fetchClasses])

  const seedDefaults = useCallback(async () => {
    setSaving(true)
    const result = await seedDefaultClassesService(campusId, { sessionId })
    setSaving(false)
    if (result.success) await fetchClasses()
    return result
  }, [campusId, sessionId, fetchClasses])

  const cloneFromSession = useCallback(async (sourceSessionId) => {
    setSaving(true)
    const result = await cloneClassesService(campusId, {
      sourceSessionId,
      targetSessionId: sessionId,
    })
    setSaving(false)
    if (result.success) await fetchClasses()
    return result
  }, [campusId, sessionId, fetchClasses])

  // ── Section mutations (per-class) ─────────────────────────────────────────
  const addSection = useCallback(async (classGroupId, name) => {
    setSaving(true)
    const result = await addSectionService(campusId, classGroupId, { name })
    setSaving(false)
    if (result.success) await refreshClassSections(classGroupId)
    return result
  }, [campusId, refreshClassSections])

  const updateSection = useCallback(async (classGroupId, sectionId, name) => {
    setSaving(true)
    const result = await updateSectionService(campusId, classGroupId, sectionId, { name })
    setSaving(false)
    if (result.success) await refreshClassSections(classGroupId)
    return result
  }, [campusId, refreshClassSections])

  const deleteSection = useCallback(async (classGroupId, sectionId) => {
    setDeleting(true)
    const result = await deleteSectionService(campusId, classGroupId, sectionId)
    setDeleting(false)
    if (result.success) await refreshClassSections(classGroupId)
    return result
  }, [campusId, refreshClassSections])

  return {
    classes,
    total,
    loading,
    error,
    saving,
    deleting,
    fetchClasses,
    createClass,
    updateClass,
    deleteClass,
    seedDefaults,
    cloneFromSession,
    addSection,
    updateSection,
    deleteSection,
  }
}
