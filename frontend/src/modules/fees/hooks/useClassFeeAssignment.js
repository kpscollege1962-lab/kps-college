import { useState, useCallback } from 'react'
import { getClassFeeSetupService, assignClassFeesService } from '../services/classFeeAssignment.service'

export const useClassFeeAssignment = (campusId) => {
  const [setup, setSetup]       = useState(null) // { fees: [], facilities: [], fines: [] }
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [assigning, setAssigning] = useState(false)

  const fetchSetup = useCallback(async (classGroupId, sessionId) => {
    setLoading(true)
    setError(null)
    const result = await getClassFeeSetupService(campusId, classGroupId, { sessionId })
    setLoading(false)
    if (result.success) setSetup(result.data.setup)
    else setError(result.message)
    return result
  }, [campusId])

  const assignFees = useCallback(async (classGroupId, data) => {
    setAssigning(true)
    const result = await assignClassFeesService(campusId, classGroupId, data)
    setAssigning(false)
    return result
  }, [campusId])

  const clear = useCallback(() => {
    setSetup(null)
    setError(null)
  }, [])

  return { setup, loading, error, assigning, fetchSetup, assignFees, clear }
}