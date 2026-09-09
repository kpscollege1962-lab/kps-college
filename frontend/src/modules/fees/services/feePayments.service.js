import { handleApiCall } from '@/lib/apiUtils'
import { createPaymentApi, deletePaymentApi } from '../api/feePayments.api'

export const createPaymentService = (campusId, challanId, data) =>
  handleApiCall(() => createPaymentApi(campusId, challanId, data),        'Failed to record payment')

export const deletePaymentService = (campusId, challanId, paymentId) =>
  handleApiCall(() => deletePaymentApi(campusId, challanId, paymentId),   'Failed to void payment')