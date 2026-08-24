import { useState, useCallback, useRef } from 'react'
import {
  listStudentsService,
  createStudentService,
  updateStudentService,
} from '../services/students.service'

const DEFAULT_LIMIT = 30

export const useStudents = () => {
  const [students, setStudents]        = useState([])
  const [total, setTotal]              = useState(0)
  const [page, setPage]                = useState(1)
  const [limit, setLimit]              = useState(DEFAULT_LIMIT)
  const [loading, setLoading]          = useState(false)
  const [error, setError]              = useState(null)
  const [saving, setSaving]            = useState(false)
  const [saveError, setSaveError]      = useState(null)

  // Stores the last params used so refresh calls stay consistent
  const lastParamsRef = useRef({})
  const limitRef      = useRef(DEFAULT_LIMIT)

  const fetchStudents = useCallback(async (params = {}) => {
    const merged = { limit: limitRef.current, page, ...lastParamsRef.current, ...params }
    if (params.limit !== undefined) { limitRef.current = params.limit; setLimit(params.limit) }
    lastParamsRef.current = merged

    setLoading(true)
    setError(null)

    const result = await listStudentsService({ ...merged })

    setLoading(false)

    if (result.success) {
      setStudents(result.data.data)
      setTotal(result.data.total)
      setPage(result.data.page)
    } else {
      setError(result.message)
    }
  }, [page])

  const createStudent = useCallback(async (data) => {
    setSaving(true)
    setSaveError(null)

    const result = await createStudentService(data)

    setSaving(false)

    if (result.success) {
      await fetchStudents(lastParamsRef.current)
    } else {
      setSaveError(result.message)
    }

    return { success: result.success, message: result.message, data: result.data }
  }, [fetchStudents])

  const updateStudent = useCallback(async (id, data) => {
    setSaving(true)
    setSaveError(null)

    const result = await updateStudentService(id, data)

    setSaving(false)

    if (result.success) {
      await fetchStudents(lastParamsRef.current)
    } else {
      setSaveError(result.message)
    }

    return { success: result.success, message: result.message, data: result.data }
  }, [fetchStudents])

  return {
    students,
    total,
    page,
    limit,
    loading,
    error,
    saving,
    saveError,
    fetchStudents,
    createStudent,
    updateStudent,
  }
}
