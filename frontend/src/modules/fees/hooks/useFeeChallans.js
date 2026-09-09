import { useState, useCallback } from 'react'
import { listChallansService, cancelChallanService } from '../services/feeChallans.service'

export const useFeeChallans = (campusId) => {
  const [challans, setChallans] = useState([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [cancelling, setCancelling] = useState(false)

  const fetchChallans = useCallback(async (params) => {
    setLoading(true)
    setError(null)
    const result = await listChallansService(campusId, params)
    setLoading(false)
    if (result.success) {
      setChallans(result.data.data)
      setTotal(result.data.total)
    } else {
      setError(result.message)
    }
    return result
  }, [campusId])

  const cancelChallan = useCallback(async (challanId, refetchParams) => {
    setCancelling(true)
    const result = await cancelChallanService(campusId, challanId)
    setCancelling(false)
    if (result.success && refetchParams) await fetchChallans(refetchParams)
    return result
  }, [campusId, fetchChallans])

  return { challans, total, loading, error, cancelling, fetchChallans, cancelChallan }
}