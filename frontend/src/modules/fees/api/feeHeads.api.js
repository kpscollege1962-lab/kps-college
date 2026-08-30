import api from '@/lib/api'

const base = (campusId) => `/campuses/${campusId}/fee-heads`

export const listFeeHeadsApi  = (campusId, params)          => api.get(base(campusId), { params })
export const getFeeHeadApi    = (campusId, feeHeadId)        => api.get(`${base(campusId)}/${feeHeadId}`)
export const createFeeHeadApi = (campusId, data)             => api.post(base(campusId), data)
export const updateFeeHeadApi = (campusId, feeHeadId, data)  => api.patch(`${base(campusId)}/${feeHeadId}`, data)
export const deleteFeeHeadApi = (campusId, feeHeadId)        => api.delete(`${base(campusId)}/${feeHeadId}`)