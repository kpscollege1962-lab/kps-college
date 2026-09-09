import { useState, useCallback } from 'react'
import { createPaymentService, deletePaymentService } from '../services/feePayments.service'

export const useFeePayments = (campusId) => {
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState(false)

  const recordPayment = useCallback(async (challanId, data) => {
    setSaving(true)
    const result = await createPaymentService(campusId, challanId, data)
    setSaving(false)
    return result
  }, [campusId])

  const voidPayment = useCallback(async (challanId, paymentId) => {
    setDeleting(true)
    const result = await deletePaymentService(campusId, challanId, paymentId)
    setDeleting(false)
    return result
  }, [campusId])

  return { saving, deleting, recordPayment, voidPayment }
}