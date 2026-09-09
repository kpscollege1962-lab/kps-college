import api from '@/lib/api'

const base = (campusId, challanId) => `/campuses/${campusId}/fee-challans/${challanId}/payments`

export const createPaymentApi = (campusId, challanId, data)      => api.post(base(campusId, challanId), data)
export const deletePaymentApi = (campusId, challanId, paymentId) => api.delete(`${base(campusId, challanId)}/${paymentId}`)