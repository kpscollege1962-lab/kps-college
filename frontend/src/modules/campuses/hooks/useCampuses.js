import { useState, useCallback, useRef } from 'react'
import {
  listCampusesService,
  createCampusService,
  updateCampusService,
} from '../services/campuses.service'

export const useCampuses = () => {
  const [campuses, setCampuses] = useState([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [saving, setSaving]     = useState(false)
  const [saveError, setSaveError] = useState(null)

  // Stores the last params used so refresh calls stay consistent
  const lastParamsRef = useRef({})

  const fetchCampuses = useCallback(async (params = {}) => {
    const merged = { page, ...lastParamsRef.current, ...params }
    lastParamsRef.current = merged

    setLoading(true)
    setError(null)

    const result = await listCampusesService(merged)

    setLoading(false)

    if (result.success) {
      setCampuses(result.data.data)
      setTotal(result.data.total)
      setPage(result.data.page)
    } else {
      setError(result.message)
    }
  }, [page])

  const createCampus = useCallback(async (data) => {
    setSaving(true)
    setSaveError(null)

    const result = await createCampusService(data)

    setSaving(false)

    if (result.success) {
      await fetchCampuses(lastParamsRef.current)
    } else {
      setSaveError(result.message)
    }

    return { success: result.success, message: result.message, data: result.data }
  }, [fetchCampuses])

  const updateCampus = useCallback(async (id, data) => {
    setSaving(true)
    setSaveError(null)

    const result = await updateCampusService(id, data)

    setSaving(false)

    if (result.success) {
      await fetchCampuses(lastParamsRef.current)
    } else {
      setSaveError(result.message)
    }

    return { success: result.success, message: result.message, data: result.data }
  }, [fetchCampuses])

  return {
    campuses,
    total,
    page,
    loading,
    error,
    saving,
    saveError,
    fetchCampuses,
    createCampus,
    updateCampus,
  }
}
