import { useState, useCallback } from 'react'
import { getStaffService } from '../services/staff.service'

export const useStaffMember = (campusId, staffId) => {
  const [staff,   setStaff]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const fetchStaff = useCallback(async () => {
    setLoading(true)
    setError(null)
    const result = await getStaffService(campusId, staffId)
    setLoading(false)
    if (result.success) {
      setStaff(result.data.staff)
    } else {
      setError(result.message)
    }
  }, [campusId, staffId])

  return { staff, loading, error, fetchStaff }
}
