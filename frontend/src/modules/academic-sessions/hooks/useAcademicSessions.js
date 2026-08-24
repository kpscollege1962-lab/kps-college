import { useState, useCallback, useRef } from 'react'
import {
  listAcademicSessionsService,
  createAcademicSessionService,
  updateAcademicSessionService,
  transitionAcademicSessionService,
  deleteAcademicSessionService,
} from '../services/academicSessions.service'

export const useAcademicSessions = () => {
  const [sessions, setSessions]               = useState([])
  const [total, setTotal]                     = useState(0)
  const [page, setPage]                       = useState(1)
  const [loading, setLoading]                 = useState(false)
  const [error, setError]                     = useState(null)
  const [saving, setSaving]                   = useState(false)
  const [saveError, setSaveError]             = useState(null)
  const [transitioning, setTransitioning]     = useState(false)
  const [transitionError, setTransitionError] = useState(null)
  const [deleting, setDeleting]               = useState(false)
  const [deleteError, setDeleteError]         = useState(null)

  const lastParamsRef = useRef({})

  const fetchSessions = useCallback(async (params = {}) => {
    const merged = { page, ...lastParamsRef.current, ...params }
    lastParamsRef.current = merged

    setLoading(true)
    setError(null)

    const result = await listAcademicSessionsService(merged)

    setLoading(false)

    if (result.success) {
      setSessions(result.data.data)
      setTotal(result.data.total)
      setPage(result.data.page)
    } else {
      setError(result.message)
    }
  }, [page])

  const createSession = useCallback(async (data) => {
    setSaving(true)
    setSaveError(null)
    const result = await createAcademicSessionService(data)
    setSaving(false)
    if (result.success) await fetchSessions(lastParamsRef.current)
    else setSaveError(result.message)
    return { success: result.success, message: result.message, data: result.data }
  }, [fetchSessions])

  const updateSession = useCallback(async (id, data) => {
    setSaving(true)
    setSaveError(null)
    const result = await updateAcademicSessionService(id, data)
    setSaving(false)
    if (result.success) await fetchSessions(lastParamsRef.current)
    else setSaveError(result.message)
    return { success: result.success, message: result.message, data: result.data }
  }, [fetchSessions])

  const transitionSession = useCallback(async (id) => {
    setTransitioning(true)
    setTransitionError(null)
    const result = await transitionAcademicSessionService(id)
    setTransitioning(false)
    if (result.success) await fetchSessions(lastParamsRef.current)
    else setTransitionError(result.message)
    return { success: result.success, message: result.message }
  }, [fetchSessions])

  const deleteSession = useCallback(async (id) => {
    setDeleting(true)
    setDeleteError(null)
    const result = await deleteAcademicSessionService(id)
    setDeleting(false)
    if (result.success) await fetchSessions(lastParamsRef.current)
    else setDeleteError(result.message)
    return { success: result.success, message: result.message }
  }, [fetchSessions])

  return {
    sessions, total, page,
    loading, error,
    saving, saveError,
    transitioning, transitionError,
    deleting, deleteError,
    fetchSessions, createSession, updateSession, transitionSession, deleteSession,
  }
}
