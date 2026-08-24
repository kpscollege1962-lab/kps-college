import { useState, useCallback, useRef } from 'react'
import {
  listSubjectsService,
  createSubjectService,
  updateSubjectService,
  deleteSubjectService,
} from '../services/subjects.service'

export const useSubjects = () => {
  const [subjects, setSubjects]         = useState([])
  const [total, setTotal]               = useState(0)
  const [page, setPage]                 = useState(1)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState(null)
  const [saving, setSaving]             = useState(false)
  const [saveError, setSaveError]       = useState(null)
  const [deleting, setDeleting]         = useState(false)
  const [deleteError, setDeleteError]   = useState(null)

  const lastParamsRef = useRef({})

  const fetchSubjects = useCallback(async (params = {}) => {
    const merged = { page, ...lastParamsRef.current, ...params }
    lastParamsRef.current = merged

    setLoading(true)
    setError(null)

    const result = await listSubjectsService(merged)

    setLoading(false)

    if (result.success) {
      setSubjects(result.data.data)
      setTotal(result.data.total)
      setPage(result.data.page)
    } else {
      setError(result.message)
    }
  }, [page])

  const createSubject = useCallback(async (data) => {
    setSaving(true)
    setSaveError(null)

    const result = await createSubjectService(data)

    setSaving(false)

    if (result.success) {
      await fetchSubjects(lastParamsRef.current)
    } else {
      setSaveError(result.message)
    }

    return { success: result.success, message: result.message, data: result.data }
  }, [fetchSubjects])

  const updateSubject = useCallback(async (id, data) => {
    setSaving(true)
    setSaveError(null)

    const result = await updateSubjectService(id, data)

    setSaving(false)

    if (result.success) {
      await fetchSubjects(lastParamsRef.current)
    } else {
      setSaveError(result.message)
    }

    return { success: result.success, message: result.message, data: result.data }
  }, [fetchSubjects])

  const deleteSubject = useCallback(async (id) => {
    setDeleting(true)
    setDeleteError(null)

    const result = await deleteSubjectService(id)

    setDeleting(false)

    if (result.success) {
      await fetchSubjects(lastParamsRef.current)
    } else {
      setDeleteError(result.message)
    }

    return { success: result.success, message: result.message }
  }, [fetchSubjects])

  return {
    subjects,
    total,
    page,
    loading,
    error,
    saving,
    saveError,
    deleting,
    deleteError,
    fetchSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
  }
}
