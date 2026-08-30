import { useState, useCallback, useRef, useEffect } from 'react'
import {
  listFeeHeadsService,
  createFeeHeadService,
  updateFeeHeadService,
  deleteFeeHeadService,
} from '../services/feeHeads.service'

export const useFeeHeads = (campusId) => {
  const [feeHeads, setFeeHeads] = useState([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState(false)

  const lastParamsRef = useRef({})

  useEffect(() => {
    lastParamsRef.current = {}
  }, [campusId])

  const fetchFeeHeads = useCallback(async (params = {}) => {
    const userParams = { ...lastParamsRef.current, ...params }
    lastParamsRef.current = userParams
    setLoading(true)
    setError(null)
    const result = await listFeeHeadsService(campusId, userParams)
    setLoading(false)
    if (result.success) {
      setFeeHeads(result.data.data)
      setTotal(result.data.total)
    } else {
      setError(result.message)
    }
  }, [campusId])

  const createFeeHead = useCallback(async (data) => {
    setSaving(true)
    const result = await createFeeHeadService(campusId, data)
    setSaving(false)
    if (result.success) await fetchFeeHeads()
    return result
  }, [campusId, fetchFeeHeads])

  const updateFeeHead = useCallback(async (feeHeadId, data) => {
    setSaving(true)
    const result = await updateFeeHeadService(campusId, feeHeadId, data)
    setSaving(false)
    if (result.success) await fetchFeeHeads()
    return result
  }, [campusId, fetchFeeHeads])

  const deleteFeeHead = useCallback(async (feeHeadId) => {
    setDeleting(true)
    const result = await deleteFeeHeadService(campusId, feeHeadId)
    setDeleting(false)
    if (result.success) await fetchFeeHeads()
    return result
  }, [campusId, fetchFeeHeads])

  return {
    feeHeads,
    total,
    loading,
    error,
    saving,
    deleting,
    fetchFeeHeads,
    createFeeHead,
    updateFeeHead,
    deleteFeeHead,
  }
}