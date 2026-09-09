import { useState, useCallback } from 'react'
import { listMyFeeChallansService } from '../services/myFees.service'

export const useMyFeeChallans = () => {
  const [challans, setChallans] = useState([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  const fetchMyChallans = useCallback(async () => {
    setLoading(true)
    setError(null)
    const result = await listMyFeeChallansService()
    setLoading(false)
    if (result.success) setChallans(result.data.data)
    else setError(result.message)
  }, [])

  return { challans, loading, error, fetchMyChallans }
}