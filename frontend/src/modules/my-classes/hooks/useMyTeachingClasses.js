import { useState, useCallback } from 'react'
import { listMyTeachingClassesService } from '../services/myClasses.service'

export const useMyTeachingClasses = (campusId) => {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const fetchClasses = useCallback(async () => {
    if (!campusId) return
    setLoading(true)
    setError(null)
    const result = await listMyTeachingClassesService(campusId)
    setLoading(false)
    if (result.success) setClasses(result.data.classes)
    else setError(result.message)
  }, [campusId])

  return { classes, loading, error, fetchClasses }
}