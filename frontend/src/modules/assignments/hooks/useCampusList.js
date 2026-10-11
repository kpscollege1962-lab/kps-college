import { useState, useCallback } from 'react'
import { listCampusesService } from '../services/assignments.service'

export const useCampusList = () => {
  const [campuses, setCampuses] = useState([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  const fetchCampuses = useCallback(async () => {
    setLoading(true)
    setError(null)
    const result = await listCampusesService()
    setLoading(false)
    if (result.success) {
      const payload = result.data
      setCampuses(Array.isArray(payload) ? payload : (payload?.data ?? payload?.campuses ?? []))
    } else {
      setError(result.message)
    }
  }, [])

  return { campuses, loading, error, fetchCampuses }
}