import { useState, useCallback } from 'react'
import {
  listHomeworkService, createHomeworkService, updateHomeworkService, deleteHomeworkService,
} from '../services/homework.service'

export const useHomework = (campusId) => {
  const [homework, setHomework] = useState([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fetchHomework = useCallback(async (params) => {
    setLoading(true)
    setError(null)
    const result = await listHomeworkService(campusId, params)
    setLoading(false)
    if (result.success) {
      setHomework(result.data.data)
      setTotal(result.data.total)
    } else {
      setError(result.message)
    }
    return result
  }, [campusId])

  const createHomework = useCallback(async (formData, refetchParams) => {
    setSaving(true)
    const result = await createHomeworkService(campusId, formData)
    setSaving(false)
    if (result.success && refetchParams) await fetchHomework(refetchParams)
    return result
  }, [campusId, fetchHomework])

  const updateHomework = useCallback(async (homeworkId, formData, refetchParams) => {
    setSaving(true)
    const result = await updateHomeworkService(campusId, homeworkId, formData)
    setSaving(false)
    if (result.success && refetchParams) await fetchHomework(refetchParams)
    return result
  }, [campusId, fetchHomework])

  const deleteHomework = useCallback(async (homeworkId, refetchParams) => {
    setDeleting(true)
    const result = await deleteHomeworkService(campusId, homeworkId)
    setDeleting(false)
    if (result.success && refetchParams) await fetchHomework(refetchParams)
    return result
  }, [campusId, fetchHomework])

  return { homework, total, loading, error, saving, deleting, fetchHomework, createHomework, updateHomework, deleteHomework }
}