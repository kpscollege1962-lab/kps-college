import { useState, useCallback, useRef, useEffect } from 'react'
import { useSessionContext } from '@/shells/portal/hooks/useSessionContext'
import {
  listEnrollmentsService,
  createEnrollmentService,
  deleteEnrollmentService,
} from '../services/enrollments.service'
import { listCampusesService }  from '@/modules/campuses/services/campuses.service'
import { listClassesService }   from '@/modules/classes/services/classes.service'

const DEFAULT_LIMIT = 30

export const useEnrollments = () => {
  const { activeSession } = useSessionContext()

  // ── Reference data ────────────────────────────────────────────────────────
  const [campuses, setCampuses]             = useState([])
  const [classes,  setClasses]              = useState([])
  const [sections, setSections]             = useState([])
  const [classesLoading,  setClassesLoading]  = useState(false)

  // ── Filter / context state ────────────────────────────────────────────────
  const [campusFilter,  setCampusFilter]  = useState('')
  const [classFilter,   setClassFilter]   = useState('')
  const [sectionFilter, setSectionFilter] = useState('')
  const [statusFilter,  setStatusFilter]  = useState('active')
  const [search,        setSearch]        = useState('')

  // ── Enrollment list state ─────────────────────────────────────────────────
  const [enrollments, setEnrollments] = useState([])
  const [total,       setTotal]       = useState(0)
  const [page,        setPage]        = useState(1)
  const [limit,       setLimit]       = useState(DEFAULT_LIMIT)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState(null)

  // ── Mutation state ────────────────────────────────────────────────────────
  const [saving,   setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(false)

  const lastParamsRef = useRef({})
  const limitRef      = useRef(DEFAULT_LIMIT)

  // ── Fetch campuses once on mount ──────────────────────────────────────────
  useEffect(() => {
    listCampusesService({ limit: 100 }).then(result => {
      if (result.success) setCampuses(result.data?.data ?? [])
    })
  }, [])

  // ── Fetch classes when campus or session changes ──────────────────────────
  useEffect(() => {
    setClasses([])
    setClassFilter('')
    setSections([])
    setSectionFilter('')
    if (!campusFilter || !activeSession?.id) return
    setClassesLoading(true)
    listClassesService(campusFilter, { sessionId: activeSession.id }).then(result => {
      setClassesLoading(false)
      if (result.success) setClasses(result.data?.data ?? [])
    })
  }, [campusFilter, activeSession?.id])

  // ── Derive sections from already-loaded classes when class selection changes ──
  useEffect(() => {
    setSectionFilter('')
    if (!classFilter) {
      setSections([])
      return
    }
    const selectedClass = classes.find(c => String(c.id) === classFilter)
    setSections(selectedClass?.sections ?? [])
  }, [classFilter, classes])

  // ── Fetch enrollment list ─────────────────────────────────────────────────
  const fetchEnrollments = useCallback(async (params = {}) => {
    const merged = { limit: limitRef.current, page: 1, ...lastParamsRef.current, ...params }
    if (params.limit !== undefined) { limitRef.current = params.limit; setLimit(params.limit) }
    lastParamsRef.current = merged
    setLoading(true)
    setError(null)
    const result = await listEnrollmentsService(merged)
    setLoading(false)
    if (result.success) {
      setEnrollments(result.data.data)
      setTotal(result.data.total)
      setPage(result.data.page)
    } else {
      setError(result.message)
    }
  }, [])

  // ── Re-fetch list when session changes ────────────────────────────────────
  useEffect(() => {
    if (activeSession?.id) {
      fetchEnrollments({
        sessionId:    activeSession.id,
        campusId:     campusFilter   || undefined,
        classGroupId: classFilter    || undefined,
        sectionId:    sectionFilter  || undefined,
        status:       statusFilter   || undefined,
        page: 1,
      })
    }
  }, [activeSession?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Filter change handlers ────────────────────────────────────────────────
  // Each calls fetchEnrollments with the new filter merged in.

  const handleCampusFilterChange = useCallback((val) => {
    setCampusFilter(val)
    setClassFilter('')
    setSectionFilter('')
    fetchEnrollments({
      sessionId: activeSession?.id,
      campusId:  val || undefined,
      page: 1,
      status: statusFilter || undefined,
      search: search || undefined,
    })
  }, [activeSession?.id, statusFilter, search, fetchEnrollments])

  const handleClassFilterChange = useCallback((val) => {
    setClassFilter(val)
    setSectionFilter('')
    fetchEnrollments({
      sessionId:    activeSession?.id,
      campusId:     campusFilter   || undefined,
      classGroupId: val            || undefined,
      sectionId:    undefined,
      page: 1,
      status: statusFilter || undefined,
      search: search || undefined,
    })
  }, [activeSession?.id, campusFilter, statusFilter, search, fetchEnrollments])

  const handleSectionFilterChange = useCallback((val) => {
    setSectionFilter(val)
    fetchEnrollments({
      sessionId:    activeSession?.id,
      campusId:     campusFilter   || undefined,
      classGroupId: classFilter    || undefined,
      sectionId:    val            || undefined,
      page: 1,
      status: statusFilter || undefined,
      search: search || undefined,
    })
  }, [activeSession?.id, campusFilter, classFilter, statusFilter, search, fetchEnrollments])

  const handleStatusFilterChange = useCallback((val) => {
    setStatusFilter(val)
    fetchEnrollments({
      sessionId:    activeSession?.id,
      campusId:     campusFilter   || undefined,
      classGroupId: classFilter    || undefined,
      sectionId:    sectionFilter  || undefined,
      status:       val            || undefined,
      search:       search         || undefined,
      page: 1,
    })
  }, [activeSession?.id, campusFilter, classFilter, sectionFilter, search, fetchEnrollments])

  const handleSearchChange = useCallback((val) => {
    setSearch(val)
    // Debouncing is handled in the page/header via useEffect
  }, [])

  const triggerSearchFetch = useCallback((val) => {
    fetchEnrollments({
      sessionId:    activeSession?.id,
      campusId:     campusFilter   || undefined,
      classGroupId: classFilter    || undefined,
      sectionId:    sectionFilter  || undefined,
      status:       statusFilter   || undefined,
      search:       val            || undefined,
      page: 1,
    })
  }, [activeSession?.id, campusFilter, classFilter, sectionFilter, statusFilter, fetchEnrollments])

  const handlePageChange = useCallback((newPage) => {
    fetchEnrollments({ page: newPage })
  }, [fetchEnrollments])

  const handleLimitChange = useCallback((newLimit) => {
    fetchEnrollments({ limit: newLimit, page: 1 })
  }, [fetchEnrollments])

  // ── Enrollment CRUD ───────────────────────────────────────────────────────

  // canEnroll: all conditions for the "Enroll Student" button to be enabled
  const canEnroll =
    !!activeSession &&
    ['upcoming', 'active'].includes(activeSession.status) &&
    !!campusFilter &&
    !!classFilter &&
    (sections.length === 0 || !!sectionFilter)

  const createEnrollment = useCallback(async (studentId) => {
    setSaving(true)
    const payload = {
      campusId:     parseInt(campusFilter),
      sessionId:    activeSession?.id,
      studentId:    parseInt(studentId),
      classGroupId: parseInt(classFilter),
      // sectionId only sent if a named section is selected
      ...(sectionFilter ? { sectionId: parseInt(sectionFilter) } : {}),
    }
    const result = await createEnrollmentService(payload)
    setSaving(false)
    if (result.success) await fetchEnrollments(lastParamsRef.current)
    return result
  }, [campusFilter, classFilter, sectionFilter, activeSession?.id, fetchEnrollments])

  const deleteEnrollment = useCallback(async (enrollmentId) => {
    setDeleting(true)
    const result = await deleteEnrollmentService(enrollmentId)
    setDeleting(false)
    if (result.success) await fetchEnrollments(lastParamsRef.current)
    return result
  }, [fetchEnrollments])

  return {
    // reference data
    campuses,
    classes,
    sections,
    classesLoading,
    // filter/context state
    campusFilter,
    classFilter,
    sectionFilter,
    statusFilter,
    search,
    // filter handlers
    handleCampusFilterChange,
    handleClassFilterChange,
    handleSectionFilterChange,
    handleStatusFilterChange,
    handleSearchChange,
    triggerSearchFetch,
    handlePageChange,
    handleLimitChange,
    // enrollment list
    enrollments,
    total,
    page,
    limit,
    loading,
    error,
    // enrollment CRUD
    canEnroll,
    saving,
    deleting,
    fetchEnrollments,
    createEnrollment,
    deleteEnrollment,
  }
}
