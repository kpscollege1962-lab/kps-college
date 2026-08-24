import { useState, useCallback, useRef } from 'react'
import {
  listStaffService,
  createStaffService,
  updateStaffService,
  createStaffPostingService,
} from '../services/staff.service'

const DEFAULT_LIMIT = 30

export const useStaff = (campusId) => {
  const [staff, setStaff]         = useState([])
  const [total, setTotal]         = useState(0)
  const [page, setPage]           = useState(1)
  const [limit, setLimit]         = useState(DEFAULT_LIMIT)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)
  const [saving, setSaving]       = useState(false)
  const [saveError, setSaveError] = useState(null)

  // Stores the last params used so refresh calls stay consistent
  const lastParamsRef = useRef({})
  const limitRef      = useRef(DEFAULT_LIMIT)

  const fetchStaff = useCallback(async (params = {}) => {
    const merged = { limit: limitRef.current, page, ...lastParamsRef.current, ...params }
    if (params.limit !== undefined) { limitRef.current = params.limit; setLimit(params.limit) }
    lastParamsRef.current = merged

    setLoading(true)
    setError(null)

    const result = await listStaffService(campusId, { ...merged })

    setLoading(false)

    if (result.success) {
      setStaff(result.data.data)
      setTotal(result.data.total)
      setPage(result.data.page)
    } else {
      setError(result.message)
    }
  }, [campusId, page])

  const createStaff = useCallback(async (data) => {
    setSaving(true)
    setSaveError(null)

    const result = await createStaffService(campusId, data)

    setSaving(false)

    if (result.success) {
      await fetchStaff(lastParamsRef.current)
    } else {
      setSaveError(result.message)
    }

    return { success: result.success, message: result.message, data: result.data }
  }, [campusId, fetchStaff])

  const updateStaff = useCallback(async (id, data) => {
    setSaving(true)
    setSaveError(null)

    const result = await updateStaffService(campusId, id, data)

    setSaving(false)

    if (result.success) {
      await fetchStaff(lastParamsRef.current)
    } else {
      setSaveError(result.message)
    }

    return { success: result.success, message: result.message, data: result.data }
  }, [campusId, fetchStaff])

  const addExistingStaff = useCallback(async (staffId, data) => {
    setSaving(true)
    setSaveError(null)

    const result = await createStaffPostingService(campusId, staffId, data)

    setSaving(false)

    if (result.success) {
      await fetchStaff(lastParamsRef.current)
    } else {
      setSaveError(result.message)
    }

    return { success: result.success, message: result.message, data: result.data }
  }, [campusId, fetchStaff])

  return {
    staff,
    total,
    page,
    limit,
    loading,
    error,
    saving,
    saveError,
    fetchStaff,
    createStaff,
    updateStaff,
    addExistingStaff,
  }
}
