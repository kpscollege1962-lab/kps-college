import { useState, useCallback } from 'react'
import { getMySectionsService } from '../services/attendance.service'

const extractErrorMessage = (result) => {
  const fieldErrors = result.data?.errors?.fieldErrors
  if (fieldErrors && Object.keys(fieldErrors).length > 0) {
    return Object.values(fieldErrors).join(' • ')
  }
  return result.message
}

export const useAttendanceSections = (campusId) => {
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchMySections = useCallback(async (sessionId, date) => {
    if (!sessionId || !date) return
    setLoading(true)
    setError(null)
    const result = await getMySectionsService(campusId, sessionId, date)
    setLoading(false)
    if (result.success) {
      setSections(result.data.sections)
    } else {
      setError(extractErrorMessage(result))
    }
  }, [campusId])

  return { sections, loading, error, fetchMySections }
}
